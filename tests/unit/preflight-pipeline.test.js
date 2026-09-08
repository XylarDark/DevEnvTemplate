/**
 * The hardening gate's stages, checked the way the gate checks its subject: by evidence.
 *
 * The load-bearing test here is the gitleaks one. With the CI workflow disabled, `preflight` runs
 * the only secret scan this repository has, and a scanner that is not installed must report `not
 * run` rather than a pass. That is the fail-open shape the `verification-evidence` skill exists to
 * prevent, and it is one line of code away at all times.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');

const { STAGES, REQUIRES_SIGN_OFF, RELEASE_ONLY } = require('../../scripts/tools/preflight');
const { NOT_VERIFIABLE } = require('../../scripts/tools/verify');
const { runStage } = require('../../scripts/tools/pipeline');

const TIMEOUT = { timeout: 5000 };

const stageById = id => STAGES.find(stage => stage.id === id);

describe('preflight pipeline', () => {
  test('runs the cheap checks before the ones that depend on a build', TIMEOUT, () => {
    // `verify` builds, and the doctor stage runs the compiled CLI out of dist/, so it cannot come
    // first. Audit and signatures are independent and sit in between.
    const ids = STAGES.map(stage => stage.id);

    assert.deepStrictEqual(ids, ['verify', 'audit', 'signatures', 'secrets', 'doctor']);
  });

  test('every stage states what passing it proves', TIMEOUT, () => {
    for (const stage of STAGES) {
      assert.ok(stage.proves, `${stage.id} does not say what it proves`);
      assert.ok(stage.command, `${stage.id} has no command`);
      assert.ok(Array.isArray(stage.args), `${stage.id} has no args`);
      assert.strictEqual(typeof stage.evidence, 'function', `${stage.id} extracts no evidence`);
    }
  });

  test('invokes the doctor directly rather than through npm', TIMEOUT, () => {
    // PowerShell strips a bare `--` before npm sees it, so `npm run doctor -- --strict` silently
    // runs without the flag. See docs/KNOWN_ERRORS.md.
    const doctor = stageById('doctor');

    assert.strictEqual(doctor.command, 'node');
    assert.ok(doctor.args.includes('--strict'));
  });

  describe('evidence extraction', () => {
    test('reads the vulnerability count rather than the audit exit code', TIMEOUT, () => {
      const evidence = stageById('audit').evidence({
        stdout: 'found 0 vulnerabilities\n',
        stderr: '',
        code: 0,
      });

      assert.match(evidence, /0 vulnerabilities/);
    });

    test('reads the count of packages with verified signatures', TIMEOUT, () => {
      const evidence = stageById('signatures').evidence({
        stdout:
          'audited 176 packages in 8s\n\n176 packages have verified registry signatures\n\n' +
          '40 packages have verified attestations\n',
        stderr: '',
        code: 0,
      });

      assert.match(evidence, /176 packages have verified registry signatures/);
    });

    test('reports no evidence when npm audit prints no count', TIMEOUT, () => {
      // An audit that exits zero having audited nothing is the failure this gate exists to catch.
      assert.strictEqual(
        stageById('audit').evidence({ stdout: '', stderr: '', code: 0 }),
        null,
        'an audit with no output must not read as a pass'
      );
      assert.strictEqual(
        stageById('signatures').evidence({ stdout: '', stderr: '', code: 0 }),
        null
      );
    });

    test('accepts the verify report only when it verified', TIMEOUT, () => {
      const stage = stageById('verify');
      const report = verified => ({
        verified,
        summary: { passed: verified ? 6 : 4, failed: verified ? 0 : 2, notRun: 0, total: 6 },
      });

      assert.match(
        stage.evidence({ stdout: JSON.stringify(report(true), null, 2), stderr: '', code: 0 }),
        /6 of 6 verify stages passed/
      );
      assert.strictEqual(
        stage.evidence({ stdout: JSON.stringify(report(false), null, 2), stderr: '', code: 0 }),
        null
      );
    });

    test('finds the doctor report despite the log lines around it', TIMEOUT, () => {
      // The doctor prints "Exiting with error code due to --strict flag" *after* its JSON, which
      // defeated a naive first-brace-to-last-brace parse.
      const stage = stageById('doctor');
      const report = { healthScore: { overall: 92 }, critical: [], warnings: [] };
      const stdout = `Analyzing...\n${JSON.stringify(report, null, 2)}\nDone.\n`;

      assert.match(stage.evidence({ stdout, stderr: '', code: 0 }), /health score 92\/100/);
    });

    test('withholds evidence from a doctor run with a critical gap', TIMEOUT, () => {
      const stdout = JSON.stringify(
        { healthScore: { overall: 71 }, critical: [{ message: 'No tests' }], warnings: [] },
        null,
        2
      );

      assert.strictEqual(stageById('doctor').evidence({ stdout, stderr: '', code: 1 }), null);
    });

    test('names the open gaps when the doctor fails', TIMEOUT, () => {
      // The tail of a JSON report is the end of an array, so the default failure detail says
      // nothing about what is wrong.
      const stdout = JSON.stringify(
        {
          healthScore: { overall: 71 },
          critical: [],
          warnings: [{ category: 'security', message: 'Secrets Handling Not Detected' }],
        },
        null,
        2
      );

      const detail = stageById('doctor').failureSummary({ stdout, stderr: '', code: 1 });

      assert.match(detail, /Secrets Handling Not Detected/);
      assert.match(detail, /security/);
    });
  });

  describe('the secret scan', () => {
    test('reads the leak count from the scanner output', TIMEOUT, () => {
      const stage = stageById('secrets');

      // gitleaks writes its summary to stderr.
      assert.match(
        stage.evidence({ stdout: '', stderr: 'INF 0 leaks found\n', code: 0 }),
        /0 leaks found/
      );
      assert.match(
        stage.evidence({ stdout: '', stderr: 'INF no leaks found\n', code: 0 }),
        /0 leaks found/
      );
    });

    test('treats silent scanner output as no evidence', TIMEOUT, () => {
      // Mutation-tested on 2026-09-08: making this extractor return '0 leaks found'
      // unconditionally fails this assertion. Restored afterwards.
      assert.strictEqual(
        stageById('secrets').evidence({ stdout: '', stderr: '', code: 0 }),
        null,
        'a scanner that printed nothing has not shown that it scanned anything'
      );
    });

    test('declares how to tell whether gitleaks is installed', TIMEOUT, () => {
      // Mutation-tested on 2026-09-08: deleting `available` from the secrets stage fails here,
      // and the stage then reports a missing scanner as a spawn *failure*, which reads as "the
      // scan broke" rather than "no scan happened". Restored afterwards.
      const stage = stageById('secrets');

      assert.strictEqual(typeof stage.available, 'function');
      assert.ok(stage.unavailableDetail, 'a skipped scan must explain itself');
    });

    test('reports a missing gitleaks as not run, never as passed', TIMEOUT, () => {
      const stage = { ...stageById('secrets'), available: () => false };

      const result = runStage(stage, process.cwd());

      assert.strictEqual(result.status, 'not run');
      assert.notStrictEqual(result.status, 'passed');
      assert.strictEqual(result.evidence, null);
      assert.match(result.detail, /NOT a pass/);
      assert.match(result.detail, /gitleaks/);
    });

    test('a not-run stage blocks the gate exactly as a failure does', TIMEOUT, () => {
      const { summarize } = require('../../scripts/tools/pipeline');

      const summary = summarize([
        { status: 'passed' },
        { status: 'not run' },
        { status: 'passed' },
      ]);

      assert.strictEqual(summary.verified, false, 'silence must not clear the gate');
      assert.strictEqual(summary.counts.notRun, 1);
    });
  });

  describe('the human sign-off list', () => {
    test('adds release-only controls to the ones verify already lists', TIMEOUT, () => {
      assert.ok(RELEASE_ONLY.length > 0);
      assert.ok(
        RELEASE_ONLY.some(item => /rollback/i.test(item)),
        'a tested rollback is the canonical release-only control and must be listed'
      );
    });

    test('never drops an item verify considers unverifiable', TIMEOUT, () => {
      // This repository already carries two hand-maintained copies of this list that disagree in
      // wording. A third that silently loses an entry would be worse: preflight is the stricter
      // gate, so anything verify cannot see, preflight cannot see either.
      for (const item of NOT_VERIFIABLE) {
        assert.ok(
          REQUIRES_SIGN_OFF.includes(item),
          `preflight's sign-off list is missing "${item}", which verify.js lists as unverifiable`
        );
      }
    });
  });
});
