const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// The wrapper normalizes the compiled module's default export into a constructor.
const GapAnalyzer = require('../../scripts/tools/gap-analyzer');

/**
 * These assert that the agent-layer checks actually fire on a bad layer. The equivalent tests
 * were missing for the health score, which is how a doctor that always reported 100/100 shipped.
 */
describe('agent context gaps', () => {
  let projectDir;

  beforeEach(async () => {
    projectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-context-test-'));

    // The analyzer starts from a stack report, so write a minimal valid one.
    await fs.mkdir(path.join(projectDir, '.devenv'), { recursive: true });
    await fs.writeFile(
      path.join(projectDir, '.devenv', 'stack-report.json'),
      JSON.stringify({
        technologies: [{ name: 'Node.js', version: '24' }],
        configurations: [],
        tooling: {},
        scripts: {},
        files: { key_patterns: [] },
        frameworks: { type: 'vanilla' },
        quality: { typescript: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node',
      })
    );
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  /**
   * Runs the analyzer and returns the gaps from the JSON report, which is the artifact the
   * doctor actually consumes.
   */
  async function analyze() {
    const analyzer = new GapAnalyzer({ rootDir: projectDir, mode: 'fast' });
    await analyzer.analyze();
    const reportPath = await analyzer.saveJsonReport();
    return JSON.parse(await fs.readFile(reportPath, 'utf8')).gaps;
  }

  function titles(gaps) {
    return gaps.map(gap => gap.title);
  }

  test('reports a high-severity gap when AGENTS.md is absent', async () => {
    const gaps = await analyze();
    const gap = gaps.find(g => g.title === 'No AGENTS.md');

    assert.ok(gap, `expected a missing-AGENTS.md gap, got: ${titles(gaps).join(', ')}`);
    assert.strictEqual(gap.severity, 'high');
    assert.strictEqual(gap.category, 'agent-context');
  });

  test('reports AGENTS.md that names no runnable command', async () => {
    await fs.writeFile(
      path.join(projectDir, 'AGENTS.md'),
      '# Project\n\nWe value clean code and thorough testing.\n'
    );

    const gaps = await analyze();

    assert.ok(titles(gaps).includes('AGENTS.md Contains No Commands'));
  });

  test('accepts AGENTS.md that lists commands', async () => {
    await fs.writeFile(
      path.join(projectDir, 'AGENTS.md'),
      '# Project\n\n## Commands\n\n```bash\nnpm test\n```\n'
    );

    const gaps = await analyze();
    const agentGaps = titles(gaps.filter(g => g.category === 'agent-context'));

    assert.ok(!agentGaps.includes('No AGENTS.md'));
    assert.ok(!agentGaps.includes('AGENTS.md Contains No Commands'));
  });

  test('reports AGENTS.md that has grown into a bootstrap dump', async () => {
    const body = ['# Project', '', '```bash', 'npm test', '```', ...Array(450).fill('Prose.')];
    await fs.writeFile(path.join(projectDir, 'AGENTS.md'), body.join('\n'));

    const gaps = await analyze();
    const gap = gaps.find(g => g.title === 'AGENTS.md Is Too Long');

    assert.ok(gap, 'expected a length gap for a 455-line AGENTS.md');
    assert.match(gap.description, /455 lines/);
  });

  test('reports an always-applied rule budget over 200 lines', async () => {
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });

    const frontmatter = '---\ndescription: Big rule\nalwaysApply: true\n---\n';
    await fs.writeFile(
      path.join(rulesDir, '00-huge.mdc'),
      frontmatter + Array(250).fill('Standard text.').join('\n')
    );

    const gaps = await analyze();
    const gap = gaps.find(g => g.title === 'Always-Applied Rule Budget Exceeded');

    assert.ok(gap, 'expected an always-apply budget gap');
    assert.strictEqual(gap.severity, 'high');
    assert.match(gap.description, /00-huge\.mdc/);
  });

  test('accepts glob-scoped rules of any size', async () => {
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });

    const frontmatter = "---\ndescription: Scoped rule\nglobs: '**/*.ts'\nalwaysApply: false\n---\n";
    await fs.writeFile(
      path.join(rulesDir, '10-typescript.mdc'),
      frontmatter + Array(400).fill('Standard text.').join('\n')
    );

    const gaps = await analyze();

    assert.ok(!titles(gaps).includes('Always-Applied Rule Budget Exceeded'));
  });

  test('reports a rule with neither globs nor a description', async () => {
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });
    await fs.writeFile(
      path.join(rulesDir, '50-untriggered.mdc'),
      '---\nalwaysApply: false\n---\n\nSome guidance.\n'
    );

    const gaps = await analyze();

    assert.ok(titles(gaps).includes('Cursor Rule Has No Trigger: 50-untriggered.mdc'));
  });

  test('reports a tool shim that carries its own instructions', async () => {
    await fs.writeFile(path.join(projectDir, 'AGENTS.md'), '# Project\n\n`npm test`\n');
    await fs.writeFile(
      path.join(projectDir, 'CLAUDE.md'),
      [
        'Use tabs, not spaces.',
        'Always run the linter.',
        'Prefer composition.',
        'Write tests first.',
        'Avoid global state.',
        'Document public APIs.',
      ].join('\n')
    );

    const gaps = await analyze();

    assert.ok(titles(gaps).includes('Tool Shim Has Drifted: CLAUDE.md'));
  });

  test('accepts a shim that points at AGENTS.md', async () => {
    await fs.writeFile(path.join(projectDir, 'AGENTS.md'), '# Project\n\n`npm test`\n');
    await fs.writeFile(path.join(projectDir, 'CLAUDE.md'), '@AGENTS.md\n');

    const gaps = await analyze();

    assert.ok(!titles(gaps).includes('Tool Shim Has Drifted: CLAUDE.md'));
  });

  test('reports an inline secret in an MCP config', async () => {
    await fs.mkdir(path.join(projectDir, '.cursor'), { recursive: true });
    await fs.writeFile(
      path.join(projectDir, '.cursor', 'mcp.json'),
      JSON.stringify({
        mcpServers: {
          example: {
            command: 'npx',
            env: { EXAMPLE_API_KEY: 'sk-live-abcdef1234567890' },
          },
        },
      })
    );

    const gaps = await analyze();
    const gap = gaps.find(g => g.title === 'MCP Config Contains an Inline Secret');

    assert.ok(gap, 'expected an inline-secret gap');
    assert.strictEqual(gap.severity, 'high');
    assert.strictEqual(gap.category, 'security');
  });

  test('accepts an MCP config that references the environment', async () => {
    await fs.mkdir(path.join(projectDir, '.cursor'), { recursive: true });
    await fs.writeFile(
      path.join(projectDir, '.cursor', 'mcp.json'),
      JSON.stringify({
        mcpServers: {
          example: {
            command: 'npx',
            env: { EXAMPLE_API_KEY: '${env:EXAMPLE_API_KEY}' },
          },
        },
      })
    );

    const gaps = await analyze();

    assert.ok(!titles(gaps).includes('MCP Config Contains an Inline Secret'));
  });
});
