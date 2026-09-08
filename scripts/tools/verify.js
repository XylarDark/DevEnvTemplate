#!/usr/bin/env node

/**
 * Runs the verification pipeline in dependency order and records what each stage proved.
 *
 * The distinction this tool exists to make: an exit code says "something failed", while evidence
 * says "the test suite ran 289 tests and 286 passed". Only the second lets anyone else check the
 * claim, and "all green" asserted without evidence is how this repository shipped a doctor that
 * reported a perfect score while eleven gaps sat in its own report.
 *
 * Ordering matters. A type error makes every later result meaningless, so the pipeline stops at
 * the first failure and reports the remaining stages as NOT RUN rather than letting silence read
 * as success.
 *
 * Usage:
 *   node scripts/tools/verify.js              stop at the first failing stage
 *   node scripts/tools/verify.js --all        run every stage regardless of failures
 *   node scripts/tools/verify.js --json       machine-readable evidence
 */

const fs = require('fs');
const path = require('path');

const { describe: describeStage, runStage, summarize } = require('./pipeline');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const EVIDENCE_PATH = path.join(REPO_ROOT, '.devenv', 'verify-report.json');

/**
 * Each stage names what passing it actually demonstrates, and extracts a specific number or fact
 * from the output. `evidence` returns a human-readable string, or null when the output did not
 * contain what was expected - which is itself worth reporting.
 */
const STAGES = [
  {
    id: 'typecheck',
    title: 'Type check',
    proves: 'Every TypeScript file compiles under strict mode.',
    command: 'npx',
    args: ['tsc', '--noEmit'],
    evidence: ({ code }) => (code === 0 ? 'tsc reported no type errors' : null),
  },
  {
    id: 'lint',
    title: 'Lint',
    proves: 'No ESLint errors. Warnings are allowed and counted.',
    command: 'npx',
    args: ['eslint', '.'],
    evidence: ({ stdout, code }) => {
      const summary = stdout.match(/(\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
      if (summary) {
        return `${summary[2]} error(s), ${summary[3]} warning(s)`;
      }
      return code === 0 ? 'no problems reported' : null;
    },
  },
  {
    id: 'test',
    title: 'Tests',
    proves: 'The suite runs to completion and every test passes.',
    command: 'npm',
    args: ['test'],
    evidence: ({ stdout }) => {
      const pass = stdout.match(/^# pass (\d+)$/m);
      const fail = stdout.match(/^# fail (\d+)$/m);
      const skipped = stdout.match(/^# skipped (\d+)$/m);

      if (!pass || !fail) {
        // The suite produced no counts, so it did not run to completion. Reporting this as
        // "passed" on the strength of an exit code is the exact trap this tool avoids.
        return null;
      }

      const parts = [`${pass[1]} passed`, `${fail[1]} failed`];
      if (skipped) {
        parts.push(`${skipped[1]} skipped`);
      }
      return parts.join(', ');
    },
  },
  {
    id: 'build',
    title: 'Build',
    proves: 'A clean build produces output, with no reliance on stale artifacts.',
    command: 'npm',
    args: ['run', 'build:clean'],
    evidence: () => {
      const entry = path.join(REPO_ROOT, 'dist', 'scripts', 'doctor', 'cli.js');
      return fs.existsSync(entry) ? 'dist/scripts/doctor/cli.js was produced' : null;
    },
  },
  {
    id: 'doc-links',
    title: 'Documentation links',
    proves: 'Every relative markdown link resolves to a file that exists.',
    command: 'node',
    args: ['scripts/tools/check-doc-links.js'],
    evidence: ({ stdout }) => {
      const checked = stdout.match(/checked (\d+) markdown files/);
      return checked ? `${checked[1]} markdown files checked` : null;
    },
  },
  {
    id: 'encoding',
    title: 'Encoding',
    proves: 'No file contains double-encoded UTF-8.',
    command: 'node',
    args: ['scripts/tools/fix-mojibake.js', '--check'],
    evidence: ({ code }) => (code === 0 ? 'no mojibake found' : null),
  },
];

function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all');
  const asJson = args.includes('--json');

  const results = [];
  let stopped = false;

  for (const stage of STAGES) {
    if (stopped && !runAll) {
      results.push({
        ...describeStage(stage),
        status: 'not run',
        durationMs: 0,
        evidence: null,
        detail: 'Skipped because an earlier stage failed. This is not a pass.',
      });
      continue;
    }

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

    if (result.status !== 'passed') {
      stopped = true;
    }
  }

  const { failed, notRun, passed, verified, counts } = summarize(results);

  const report = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    verified,
    summary: counts,
    stages: results,
    notVerifiedFromRepositoryContents: NOT_VERIFIABLE,
  };

  try {
    fs.mkdirSync(path.dirname(EVIDENCE_PATH), { recursive: true });
    fs.writeFileSync(EVIDENCE_PATH, JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`Warning: could not write evidence to ${EVIDENCE_PATH}: ${error.message}`);
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.verified ? 0 : 1;
    return;
  }

  console.log('');

  for (const result of failed) {
    console.log(`${result.title} ${result.status}:`);
    console.log(`  command: ${result.command}`);
    if (result.detail) {
      console.log(
        result.detail
          .split('\n')
          .map(line => `  ${line}`)
          .join('\n')
      );
    }
    console.log('');
  }

  if (notRun.length > 0) {
    console.log(
      `Not run (an earlier stage failed): ${notRun.map(r => r.title).join(', ')}.\n` +
        'These stages proved nothing. Do not read their silence as success.\n'
    );
  }

  console.log('Not verified from repository contents:');
  for (const item of NOT_VERIFIABLE) {
    console.log(`  - ${item}`);
  }
  console.log('');

  if (report.verified) {
    console.log(`Verified: ${passed.length} of ${results.length} stages passed with evidence.`);
  } else {
    console.log(
      `Not verified: ${passed.length} of ${results.length} stages passed. Evidence in ${path.relative(REPO_ROOT, EVIDENCE_PATH)}.`
    );
  }

  process.exitCode = report.verified ? 0 : 1;
}

/**
 * Controls this pipeline cannot observe. Listed in every report so that a clean run is never
 * mistaken for a statement about them: the pipeline reads the working tree, and none of these
 * live there.
 */
const NOT_VERIFIABLE = [
  'Branch protection rules and required status checks (GitHub settings, not repository files)',
  'Whether CI actually ran these same commands on the last push',
  'Environment approval rules and deployment gates',
  'Secrets configured in GitHub Actions, and who can read them',
  'Whether the published package contents match this source tree',
  'Runtime behavior under real workloads; the tests here are unit and integration only',
];

if (require.main === module) {
  main();
}

module.exports = { STAGES, NOT_VERIFIABLE };
