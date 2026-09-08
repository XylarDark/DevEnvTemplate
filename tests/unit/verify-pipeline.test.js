const { describe, test } = require('node:test');
const assert = require('node:assert');

const { STAGES, NOT_VERIFIABLE } = require('../../scripts/tools/verify');

describe('verify pipeline', () => {
  test('runs stages in dependency order', () => {
    // A type error makes later results meaningless, so typecheck must come first and the build
    // must not precede the tests it would invalidate.
    const ids = STAGES.map(stage => stage.id);

    assert.strictEqual(ids[0], 'typecheck');
    assert.ok(ids.indexOf('lint') < ids.indexOf('test'));
    assert.ok(ids.indexOf('test') < ids.indexOf('build'));
  });

  test('every stage states what passing it proves', () => {
    for (const stage of STAGES) {
      assert.ok(stage.proves, `${stage.id} does not say what it proves`);
      assert.ok(stage.command, `${stage.id} has no command`);
    }
  });

  test('extracts test counts as evidence rather than trusting the exit code', () => {
    const stage = STAGES.find(s => s.id === 'test');

    const evidence = stage.evidence({
      stdout: '# tests 289\n# pass 286\n# fail 0\n# skipped 3\n',
      stderr: '',
      code: 0,
    });

    assert.match(evidence, /286 passed/);
    assert.match(evidence, /0 failed/);
    assert.match(evidence, /3 skipped/);
  });

  test('reports no evidence when the test suite produced no counts', () => {
    // A suite that exits zero without running is the failure this pipeline exists to catch.
    const stage = STAGES.find(s => s.id === 'test');

    assert.strictEqual(stage.evidence({ stdout: '', stderr: '', code: 0 }), null);
  });

  test('counts lint errors separately from warnings', () => {
    const stage = STAGES.find(s => s.id === 'lint');

    const evidence = stage.evidence({
      stdout: '\u2716 15 problems (0 errors, 15 warnings)\n',
      stderr: '',
      code: 0,
    });

    assert.match(evidence, /0 error\(s\)/);
    assert.match(evidence, /15 warning\(s\)/);
  });

  test('extracts the number of files checked for documentation links', () => {
    const stage = STAGES.find(s => s.id === 'doc-links');

    const evidence = stage.evidence({
      stdout: 'Doc links OK: checked 72 markdown files.\n',
      stderr: '',
      code: 0,
    });

    assert.match(evidence, /72 markdown files/);
  });

  test('lists controls it cannot see from repository contents', () => {
    assert.ok(NOT_VERIFIABLE.length > 0);
    assert.ok(
      NOT_VERIFIABLE.some(item => /branch protection/i.test(item)),
      'branch protection is the canonical example and must be listed'
    );
  });
});
