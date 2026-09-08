#!/usr/bin/env node

/**
 * The hardening gate: the one-time, repo-wide check run when features and taste are locked and
 * the product is about to be deployed.
 *
 * It exists because the checks that matter most at release time currently run nowhere. `gitleaks`,
 * `npm audit --audit-level=high`, and `npm audit signatures` lived only in the `security` job of
 * `.github/workflows/indie-ci.yml`, and that workflow is disabled. This command brings them back
 * on demand, locally, with no mail and no billed minutes.
 *
 * It is deliberately slower and stricter than `npm run verify`. Verify answers "is the tree sound
 * right now"; preflight answers "is this safe to put in front of real users", which is a question
 * you should only pay for once per release.
 *
 * Usage:
 *   node scripts/tools/preflight.js           run every stage, report evidence
 *   node scripts/tools/preflight.js --json    machine-readable evidence
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { describe: describeStage, runStage, summarize } = require('./pipeline');
const { NOT_VERIFIABLE } = require('./verify');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const EVIDENCE_PATH = path.join(REPO_ROOT, '.devenv', 'preflight-report.json');

/** True when `gitleaks` is on PATH. Absence makes the secret scan `not run`, never a pass. */
function hasGitleaks() {
  const probe = spawnSync('gitleaks', ['version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  return !probe.error && probe.status === 0;
}

const GITLEAKS_MISSING_DETAIL =
  'gitleaks is not installed, so no secret scan ran. This is NOT a pass: with CI disabled, ' +
  'this is the only secret scan in the repository. Install it (winget install gitleaks, ' +
  'brew install gitleaks, or see github.com/gitleaks/gitleaks) and run preflight again.';

const STAGES = [
  {
    id: 'verify',
    title: 'Verify pipeline',
    proves: 'Types, lint, tests, build, documentation links, and encoding are all sound.',
    command: 'node',
    args: ['scripts/tools/verify.js', '--json'],
    evidence: ({ stdout }) => {
      const report = parseJsonReport(stdout);
      if (!report || !report.summary) {
        return null;
      }
      return report.verified
        ? `${report.summary.passed} of ${report.summary.total} verify stages passed with evidence`
        : null;
    },
  },
  {
    id: 'audit',
    title: 'Dependency audit',
    proves: 'No known vulnerability at high severity or above in the dependency tree.',
    command: 'npm',
    args: ['audit', '--audit-level=high'],
    evidence: ({ stdout, stderr }) => {
      const found = `${stdout}\n${stderr}`.match(/found (\d+) vulnerabilit/i);
      return found ? `${found[1]} vulnerabilities at high or above` : null;
    },
  },
  {
    id: 'signatures',
    title: 'Registry signatures',
    proves: 'Installed packages match what the registry signed, so the supply chain is intact.',
    command: 'npm',
    args: ['audit', 'signatures'],
    evidence: ({ stdout, stderr }) => {
      const verified = `${stdout}\n${stderr}`.match(
        /(\d+) packages? have verified registry signatures/i
      );
      return verified ? `${verified[1]} packages have verified registry signatures` : null;
    },
  },
  {
    id: 'secrets',
    title: 'Secret scan',
    proves: 'No credential is committed anywhere in the history gitleaks scanned.',
    command: 'gitleaks',
    args: ['detect', '--no-banner', '--redact'],
    available: hasGitleaks,
    unavailableDetail: GITLEAKS_MISSING_DETAIL,
    evidence: ({ stdout, stderr }) => {
      // gitleaks writes its summary to stderr. Insisting on the count rather than trusting the
      // exit code is the point: a scanner that found nothing because it scanned nothing exits
      // zero too.
      const leaks = `${stdout}\n${stderr}`.match(/(\d+) leaks? found/i);
      if (leaks) {
        return `${leaks[1]} leaks found`;
      }
      return /no leaks found/i.test(`${stdout}\n${stderr}`) ? '0 leaks found' : null;
    },
  },
  {
    id: 'doctor',
    title: 'Doctor (strict)',
    proves: 'No critical gap and no warning remains open in the repository health report.',
    // Invoked directly rather than through npm: PowerShell strips a bare `--` before npm sees it,
    // so `npm run doctor -- --strict` silently runs without the flag. See docs/KNOWN_ERRORS.md.
    command: 'node',
    args: ['dist/scripts/doctor/cli.js', '--strict', '--json'],
    evidence: ({ stdout }) => {
      const report = parseJsonReport(stdout);
      const score = report && report.healthScore && report.healthScore.overall;
      if (typeof score !== 'number' || !Array.isArray(report.critical)) {
        return null;
      }
      return report.critical.length === 0 ? `health score ${score}/100, 0 critical gaps` : null;
    },
    // The tail of a JSON report is the end of an array, which says nothing about what failed.
    // Under --strict a warning blocks too, so both lists are named.
    failureSummary: ({ stdout }) => {
      const report = parseJsonReport(stdout);
      if (!report) {
        return null;
      }

      const list = (label, issues) =>
        (issues || []).length === 0
          ? []
          : [
              `${label} (${issues.length}):`,
              ...issues.map(issue => `  - [${issue.category}] ${issue.message}`),
            ];

      return [
        ...list('Critical', report.critical),
        ...list('Warnings, which --strict also blocks on', report.warnings),
      ].join('\n');
    },
  },
];

/**
 * Pulls a pretty-printed JSON report out of mixed output. Tools log around their report, so this
 * tries each line that begins a JSON object rather than assuming the first brace starts it.
 */
function parseJsonReport(stdout) {
  const lines = stdout.split('\n').map(line => line.trimEnd());
  const starts = lines.reduce((acc, line, i) => (line === '{' ? [...acc, i] : acc), []);
  const ends = lines.reduce((acc, line, i) => (line === '}' ? [i, ...acc] : acc), []);

  for (const start of starts) {
    for (const end of ends) {
      if (end <= start) {
        continue;
      }
      try {
        return JSON.parse(lines.slice(start, end + 1).join('\n'));
      } catch {
        // Not the report's extent - a tool logged before or after it. Keep looking.
      }
    }
  }

  return null;
}

/**
 * Controls a release depends on that no command in this repository can observe.
 *
 * This extends `verify.js`'s list rather than restating it, because a hand-copied second copy is
 * how two lists drift apart. The additions are the ones that only become questions at release:
 * the pipeline reads a working tree, and a deployment is not in it.
 */
const RELEASE_ONLY = [
  'Whether the artifact actually deployed was built from this commit of this tree',
  'Secret rotation, and that production secrets are separate from every other environment',
  'That a rollback has been tested, not merely described',
  'Security headers on served traffic (CSP, HSTS), which no repository check can observe',
];

const REQUIRES_SIGN_OFF = [...NOT_VERIFIABLE, ...RELEASE_ONLY];

function main() {
  const asJson = process.argv.slice(2).includes('--json');
  const results = [];

  if (!asJson) {
    console.log('\nHardening preflight. Every stage runs; none is skipped on an earlier failure,');
    console.log('because at release time you want the whole list, not the first item on it.\n');
  }

  for (const stage of STAGES) {
    if (!asJson) {
      process.stdout.write(`  ${stage.title}... `);
    }

    const result = runStage(stage, REPO_ROOT);
    results.push(result);

    if (!asJson) {
      const seconds = (result.durationMs / 1000).toFixed(1);
      console.log(
        result.status === 'passed'
          ? `passed  (${result.evidence}, ${seconds}s)`
          : `${result.status.toUpperCase()}  (${seconds}s)`
      );
    }
  }

  const { failed, notRun, passed, verified, counts } = summarize(results);

  const report = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    // `cleared` is the gate's verdict on what it could check. It is never a statement about the
    // sign-off list below, which no run of this command can satisfy.
    cleared: verified,
    summary: counts,
    stages: results,
    requiresHumanSignOff: REQUIRES_SIGN_OFF.map(item => ({ item, status: 'requires sign-off' })),
  };

  try {
    fs.mkdirSync(path.dirname(EVIDENCE_PATH), { recursive: true });
    fs.writeFileSync(EVIDENCE_PATH, JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`Warning: could not write evidence to ${EVIDENCE_PATH}: ${error.message}`);
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.cleared ? 0 : 1;
    return;
  }

  console.log('');

  for (const result of failed) {
    console.log(`${result.title} ${result.status}:`);
    console.log(`  command: ${result.command}`);
    if (result.detail) {
      console.log(indent(result.detail));
    }
    console.log('');
  }

  for (const result of notRun) {
    console.log(`${result.title} DID NOT RUN:`);
    console.log(indent(result.detail || 'No reason recorded.'));
    console.log('');
  }

  console.log('A human owns these. No run of this command can clear them:');
  for (const item of REQUIRES_SIGN_OFF) {
    console.log(`  [ ] ${item}`);
  }
  console.log('');
  console.log('Work them with the hardening pass in .agents/skills/secure-coding/SKILL.md.\n');

  if (report.cleared) {
    console.log(
      `Preflight cleared ${passed.length} of ${results.length} stages with evidence. ` +
        'The sign-off list above is still open.'
    );
  } else {
    console.log(
      `Preflight did not clear: ${passed.length} of ${results.length} stages passed. ` +
        `Evidence in ${path.relative(REPO_ROOT, EVIDENCE_PATH)}.`
    );
  }

  // `not run` and `inconclusive` block just as a failure does. The gate's whole premise is that
  // silence is not evidence, so a missing scanner cannot be the reason a release proceeds.
  process.exitCode = report.cleared ? 0 : 1;
}

function indent(text) {
  return text
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n');
}

if (require.main === module) {
  main();
}

module.exports = { STAGES, REQUIRES_SIGN_OFF, RELEASE_ONLY, describeStage };
