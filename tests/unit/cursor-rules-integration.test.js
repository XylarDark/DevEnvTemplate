const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Import the integration module (will be compiled)
let integration;
try {
  integration = require('../../dist/scripts/tools/cursor-rules-integration');
} catch {
  // Fallback to source if dist doesn't exist
  integration = require('../../scripts/tools/cursor-rules-integration');
}

const vanillaStack = {
  technologies: [],
  quality: { typescript: false },
  frameworks: { type: 'vanilla' },
  files: { key_patterns: [] },
};

describe('Cursor Rules Integration', () => {
  let tempDir;
  let templateRulesDir;
  let templateSkillsDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cursor-integration-test-'));
    templateRulesDir = path.join(tempDir, 'template', '.cursor', 'rules');
    templateSkillsDir = path.join(tempDir, 'template', '.agents', 'skills');
    projectDir = path.join(tempDir, 'project');

    await fs.mkdir(templateRulesDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    await fs.writeFile(path.join(templateRulesDir, '10-typescript.mdc'), '# TypeScript\n');
    await fs.writeFile(path.join(templateRulesDir, '12-python.mdc'), '# Python\n');
    await fs.writeFile(path.join(templateRulesDir, '21-unreal-engine.mdc'), '# Unreal\n');
    await fs.writeFile(path.join(templateRulesDir, '23-unity-csharp.mdc'), '# Unity\n');

    // A retired always-on rule left in the template must still never be copied.
    await fs.writeFile(path.join(templateRulesDir, '00-core-principles.mdc'), '# Core\n');

    for (const skill of ['plan-first', 'secure-coding']) {
      await fs.mkdir(path.join(templateSkillsDir, skill), { recursive: true });
      await fs.writeFile(
        path.join(templateSkillsDir, skill, 'SKILL.md'),
        `---\nname: ${skill}\ndescription: Use when testing.\n---\n`
      );
    }
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function integrate(stackReport = vanillaStack, overrides = {}) {
    return integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateRulesDir,
      templateSkillsPath: templateSkillsDir,
      stackReport,
      dryRun: false,
      ...overrides,
    });
  }

  test('should copy the rules matching the detected stack', async () => {
    const result = await integrate({
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] },
    });

    assert.ok(result.copied.includes('10-typescript.mdc'));
    assert.ok(!result.copied.includes('12-python.mdc'));

    const copied = await fs.readFile(
      path.join(projectDir, '.cursor', 'rules', '10-typescript.mdc'),
      'utf8'
    );
    assert.strictEqual(copied, '# TypeScript\n');
  });

  test('should never copy a retired always-on rule', async () => {
    const result = await integrate();

    assert.ok(!result.copied.includes('00-core-principles.mdc'));
    await assert.rejects(() =>
      fs.access(path.join(projectDir, '.cursor', 'rules', '00-core-principles.mdc'))
    );
  });

  test('should copy every skill regardless of stack', async () => {
    const result = await integrate();

    assert.ok(result.copied.includes('plan-first/SKILL.md'));
    assert.ok(result.copied.includes('secure-coding/SKILL.md'));

    const skill = await fs.readFile(
      path.join(projectDir, '.agents', 'skills', 'plan-first', 'SKILL.md'),
      'utf8'
    );
    assert.match(skill, /name: plan-first/);
  });

  test('should name the copied skills the host has to localize', async () => {
    // A skill that names this template's own scripts is a false statement about the host, so the
    // host is told which files to rewrite at the moment they land rather than discovering it when
    // an agent runs a command that does not exist there.
    await fs.writeFile(
      path.join(templateSkillsDir, 'plan-first', 'SKILL.md'),
      '---\nname: plan-first\ndescription: Use when testing.\n---\n\n' +
        "> **Localize on copy.** These are the template's scripts, not your project's.\n\n" +
        '```\nnpm run doctor\n```\n'
    );

    const result = await integrate();

    assert.deepStrictEqual(result.needsLocalization, ['plan-first']);
    assert.ok(
      result.recommendations.some(text => text.includes('plan-first')),
      'expected a recommendation naming the skill that needs localizing'
    );
  });

  test('should not ask a host to localize a skill with no repo-specific section', async () => {
    const result = await integrate();

    assert.deepStrictEqual(result.needsLocalization, []);
  });

  test('should copy Unreal and Unity rules when those stacks are detected', async () => {
    const result = await integrate({
      ...vanillaStack,
      unrealProjectDetected: true,
      unityProjectDetected: true,
    });

    assert.ok(result.copied.includes('21-unreal-engine.mdc'));
    assert.ok(result.copied.includes('23-unity-csharp.mdc'));
  });

  test('should preserve project-specific rules', async () => {
    const projectRulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(projectRulesDir, { recursive: true });
    await fs.writeFile(path.join(projectRulesDir, '99-custom.mdc'), '# Custom Project Rules\n');

    const result = await integrate();

    assert.ok(result.preserved.includes('99-custom.mdc'));

    const customFile = await fs.readFile(path.join(projectRulesDir, '99-custom.mdc'), 'utf8');
    assert.strictEqual(customFile, '# Custom Project Rules\n');
  });

  test('should keep a host edit to a template rule rather than overwrite it', async () => {
    const projectRulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(projectRulesDir, { recursive: true });
    await fs.writeFile(path.join(projectRulesDir, '10-typescript.mdc'), '# Edited by the host\n');

    const result = await integrate({
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] },
    });

    assert.ok(!result.copied.includes('10-typescript.mdc'));
    assert.ok(result.skipped.includes('10-typescript.mdc'));

    const kept = await fs.readFile(path.join(projectRulesDir, '10-typescript.mdc'), 'utf8');
    assert.strictEqual(kept, '# Edited by the host\n');
  });

  test('should keep an existing skill rather than overwrite it', async () => {
    const skillDir = path.join(projectDir, '.agents', 'skills', 'plan-first');
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# Host version\n');

    const result = await integrate();

    assert.ok(result.skipped.includes('plan-first/SKILL.md'));

    const kept = await fs.readFile(path.join(skillDir, 'SKILL.md'), 'utf8');
    assert.strictEqual(kept, '# Host version\n');
  });

  test('should recommend writing AGENTS.md when the host has none', async () => {
    const result = await integrate();

    assert.ok(
      result.recommendations.some(text => text.includes('AGENTS.md')),
      'expected a recommendation naming AGENTS.md'
    );
  });

  test('should not recommend AGENTS.md when the host already has one', async () => {
    await fs.writeFile(path.join(projectDir, 'AGENTS.md'), '# Host instructions\n');

    const result = await integrate();

    assert.ok(!result.recommendations.some(text => text.includes('No AGENTS.md')));
  });

  test('should tell a host where each retired rule moved', async () => {
    const projectRulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(projectRulesDir, { recursive: true });
    await fs.writeFile(path.join(projectRulesDir, '07-ai-agent-behavior.mdc'), '# Behavior\n');

    const result = await integrate();

    const advice = result.recommendations.find(text => text.includes('07-ai-agent-behavior.mdc'));
    assert.ok(advice, 'expected migration advice for the retired rule');
    assert.match(advice, /agent-workflow/);
  });

  test('should write nothing in dry-run mode', async () => {
    const result = await integrate(vanillaStack, { dryRun: true });

    assert.strictEqual(result.copied.length, 0);

    await assert.rejects(() => fs.access(path.join(projectDir, '.cursor', 'rules')));
    await assert.rejects(() => fs.access(path.join(projectDir, '.agents', 'skills')));
  });
});
