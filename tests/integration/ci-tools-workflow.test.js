const assert = require('assert');
const { describe, it, before, after } = require('node:test');
const path = require('path');
const { promises: fs } = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

describe('CI Tools Workflow Integration', () => {
  let tempDir;
  let projectRoot;

  before(async () => {
    // Create a temporary project directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ci-workflow-test-'));
    projectRoot = path.resolve(__dirname, '../..');
    
    // Create a minimal test project structure
    await fs.mkdir(path.join(tempDir, '.devenv'), { recursive: true });
    
    // Create a basic package.json
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          test: 'echo "no tests"'
        }
      }, null, 2)
    );
    
    // Create a simple source file
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'src', 'index.js'),
      'console.log("Hello World");'
    );
  });

  after(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should run stack-detector and generate stack report', async () => {
    const stackDetectorPath = path.join(projectRoot, 'scripts', 'tools', 'stack-detector.js');
    
    const { stdout } = await execAsync(
      `node "${stackDetectorPath}"`,
      { cwd: tempDir }
    );
    
    // Verify stack report was created
    const stackReportPath = path.join(tempDir, '.devenv', 'stack-report.json');
    const stackReportExists = await fs.access(stackReportPath).then(() => true).catch(() => false);
    assert.ok(stackReportExists, 'Stack report should be created');
    
    // Verify stack report content
    const stackReport = JSON.parse(await fs.readFile(stackReportPath, 'utf8'));
    assert.ok(stackReport.technologies, 'Stack report should have technologies');
    assert.ok(stackReport.configurations, 'Stack report should have configurations');
    assert.ok(Array.isArray(stackReport.technologies), 'Technologies should be an array');
    
    // Should detect Node.js
    const hasNodeJs = stackReport.technologies.some(t => t.name === 'Node.js');
    assert.ok(hasNodeJs, 'Should detect Node.js');
  });

  it('should run gap-analyzer after stack-detector', async () => {
    // First ensure stack report exists
    const stackReportPath = path.join(tempDir, '.devenv', 'stack-report.json');
    const stackReportExists = await fs.access(stackReportPath).then(() => true).catch(() => false);
    
    if (!stackReportExists) {
      // Run stack detector first
      const stackDetectorPath = path.join(projectRoot, '.github', 'tools', 'stack-detector.js');
      await execAsync(`node "${stackDetectorPath}"`, { cwd: tempDir });
    }
    
    // Run gap analyzer
    const gapAnalyzerPath = path.join(projectRoot, 'scripts', 'tools', 'gap-analyzer.js');
    const { stdout } = await execAsync(
      `node "${gapAnalyzerPath}"`,
      { cwd: tempDir }
    );
    
    // Verify gaps report was created
    const gapsReportPath = path.join(tempDir, '.devenv', 'gaps-report.md');
    const gapsReportExists = await fs.access(gapsReportPath).then(() => true).catch(() => false);
    assert.ok(gapsReportExists, 'Gaps report should be created');
    
    // Verify gaps report content
    const gapsReport = await fs.readFile(gapsReportPath, 'utf8');
    assert.ok(gapsReport.includes('# DevEnvTemplate Gap Analysis Report'), 'Should have report title');
    assert.ok(gapsReport.includes('Generated:'), 'Should have timestamp');
    assert.ok(gapsReport.includes('Total gaps found:'), 'Should have gap count');
  });

  it('should run plan-generator after gap-analyzer', async () => {
    // Ensure gaps report exists
    const gapsReportPath = path.join(tempDir, '.devenv', 'gaps-report.md');
    const gapsReportExists = await fs.access(gapsReportPath).then(() => true).catch(() => false);
    
    if (!gapsReportExists) {
      // Run stack detector and gap analyzer first
      const stackDetectorPath = path.join(projectRoot, '.github', 'tools', 'stack-detector.js');
      await execAsync(`node "${stackDetectorPath}"`, { cwd: tempDir });
      
      const gapAnalyzerPath = path.join(projectRoot, 'scripts', 'tools', 'gap-analyzer.js');
      await execAsync(`node "${gapAnalyzerPath}"`, { cwd: tempDir });
    }
    
    // Run plan generator
    const planGeneratorPath = path.join(projectRoot, 'scripts', 'tools', 'plan-generator.js');
    const { stdout } = await execAsync(
      `node "${planGeneratorPath}"`,
      { cwd: tempDir }
    );
    
    // Verify hardening plan was created
    const planPath = path.join(tempDir, '.devenv', 'hardening-plan.md');
    const planExists = await fs.access(planPath).then(() => true).catch(() => false);
    assert.ok(planExists, 'Hardening plan should be created');
    
    // Verify plan content
    const plan = await fs.readFile(planPath, 'utf8');
    assert.ok(plan.includes('# DevEnvTemplate Hardening Plan'), 'Should have plan title');
    assert.ok(plan.includes('## 📊 Plan Summary'), 'Should have summary section');
    assert.ok(plan.includes('**Total Tasks:**'), 'Should have task count');
    assert.ok(plan.includes('## 🛠️ Implementation Guidelines'), 'Should have implementation guidelines');
  });

  it('should complete full CI workflow: stack-detector → gap-analyzer → plan-generator', async () => {
    // Clean up existing reports
    const devenvDir = path.join(tempDir, '.devenv');
    try {
      await fs.rm(devenvDir, { recursive: true, force: true });
      await fs.mkdir(devenvDir, { recursive: true });
    } catch (error) {
      // Directory might not exist
    }
    
    // Run full workflow
    const stackDetectorPath = path.join(projectRoot, '.github', 'tools', 'stack-detector.js');
    const gapAnalyzerPath = path.join(projectRoot, 'scripts', 'tools', 'gap-analyzer.js');
    const planGeneratorPath = path.join(projectRoot, 'scripts', 'tools', 'plan-generator.js');
    
    // Step 1: Stack Detection
    await execAsync(`node "${stackDetectorPath}"`, { cwd: tempDir });
    const stackReportExists = await fs.access(path.join(devenvDir, 'stack-report.json'))
      .then(() => true).catch(() => false);
    assert.ok(stackReportExists, 'Step 1: Stack report created');
    
    // Step 2: Gap Analysis
    await execAsync(`node "${gapAnalyzerPath}"`, { cwd: tempDir });
    const gapsReportExists = await fs.access(path.join(devenvDir, 'gaps-report.md'))
      .then(() => true).catch(() => false);
    assert.ok(gapsReportExists, 'Step 2: Gaps report created');
    
    // Step 3: Plan Generation
    await execAsync(`node "${planGeneratorPath}"`, { cwd: tempDir });
    const planExists = await fs.access(path.join(devenvDir, 'hardening-plan.md'))
      .then(() => true).catch(() => false);
    assert.ok(planExists, 'Step 3: Hardening plan created');
    
    // Verify all artifacts exist
    const files = await fs.readdir(devenvDir);
    assert.ok(files.includes('stack-report.json'), 'Should have stack-report.json');
    assert.ok(files.includes('gaps-report.md'), 'Should have gaps-report.md');
    assert.ok(files.includes('hardening-plan.md'), 'Should have hardening-plan.md');
  });

  it('should handle missing stack report gracefully in gap-analyzer', async () => {
    // Create a clean temp directory without stack report
    const cleanDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ci-clean-test-'));
    await fs.mkdir(path.join(cleanDir, '.devenv'), { recursive: true });
    
    try {
      const gapAnalyzerPath = path.join(projectRoot, 'scripts', 'tools', 'gap-analyzer.js');
      await execAsync(`node "${gapAnalyzerPath}"`, { cwd: cleanDir });
      assert.fail('Should have thrown error for missing stack report');
    } catch (error) {
      assert.ok(error.message.includes('Stack report not found'), 'Should error about missing stack report');
    } finally {
      await fs.rm(cleanDir, { recursive: true, force: true });
    }
  });

  it('should handle missing gaps report gracefully in plan-generator', async () => {
    // Create a clean temp directory without gaps report
    const cleanDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ci-clean-test-'));
    await fs.mkdir(path.join(cleanDir, '.devenv'), { recursive: true });
    
    try {
      const planGeneratorPath = path.join(projectRoot, 'scripts', 'tools', 'plan-generator.js');
      await execAsync(`node "${planGeneratorPath}"`, { cwd: cleanDir });
      assert.fail('Should have thrown error for missing gaps report');
    } catch (error) {
      assert.ok(error.message.includes('Gaps report not found'), 'Should error about missing gaps report');
    } finally {
      await fs.rm(cleanDir, { recursive: true, force: true });
    }
  });

  it('should validate gap report structure is parseable by plan-generator', async () => {
    // Ensure gap report exists
    const gapsReportPath = path.join(tempDir, '.devenv', 'gaps-report.md');
    const gapsReportExists = await fs.access(gapsReportPath).then(() => true).catch(() => false);
    
    if (!gapsReportExists) {
      const stackDetectorPath = path.join(projectRoot, '.github', 'tools', 'stack-detector.js');
      await execAsync(`node "${stackDetectorPath}"`, { cwd: tempDir });
      
      const gapAnalyzerPath = path.join(projectRoot, 'scripts', 'tools', 'gap-analyzer.js');
      await execAsync(`node "${gapAnalyzerPath}"`, { cwd: tempDir });
    }
    
    // Read gaps report
    const gapsReport = await fs.readFile(gapsReportPath, 'utf8');
    
    // Verify report has correct structure
    assert.ok(gapsReport.includes('# DevEnvTemplate Gap Analysis Report'), 'Should have report title');
    assert.ok(gapsReport.includes('Generated:'), 'Should have generation timestamp');
    assert.ok(gapsReport.includes('Total gaps found:'), 'Should have total count');
    
    // If there are gaps, verify they have structured fields
    const hasGaps = /### [🔴🟡🟢] .+/.test(gapsReport);
    if (hasGaps) {
      // Verify structured fields exist when there are gaps
      assert.ok(gapsReport.includes('**Category:**'), 'Gaps should have Category field');
      assert.ok(gapsReport.includes('**Impact:**'), 'Gaps should have Impact field');
      assert.ok(gapsReport.includes('**Recommendation:**'), 'Gaps should have Recommendation field');
      assert.ok(gapsReport.includes('**Effort:**'), 'Gaps should have Effort field');
      assert.ok(gapsReport.includes('**Files:**'), 'Gaps should have Files field');
    }
  });

  it('should generate actionable plan with code snippets', async () => {
    const planPath = path.join(tempDir, '.devenv', 'hardening-plan.md');
    const planExists = await fs.access(planPath).then(() => true).catch(() => false);
    
    if (!planExists) {
      // Run full workflow
      const stackDetectorPath = path.join(projectRoot, '.github', 'tools', 'stack-detector.js');
      const gapAnalyzerPath = path.join(projectRoot, 'scripts', 'tools', 'gap-analyzer.js');
      const planGeneratorPath = path.join(projectRoot, 'scripts', 'tools', 'plan-generator.js');
      
      await execAsync(`node "${stackDetectorPath}"`, { cwd: tempDir });
      await execAsync(`node "${gapAnalyzerPath}"`, { cwd: tempDir });
      await execAsync(`node "${planGeneratorPath}"`, { cwd: tempDir });
    }
    
    // Read and verify plan content
    const plan = await fs.readFile(planPath, 'utf8');
    
    // Should have implementation guidelines
    assert.ok(plan.includes('Using Cursor Plan Mode'), 'Should have Cursor Plan Mode instructions');
    assert.ok(plan.includes('Task Completion Workflow'), 'Should have task workflow');
    assert.ok(plan.includes('Rollback Strategy'), 'Should have rollback instructions');
    
    // Should have success metrics
    assert.ok(plan.includes('Success Metrics'), 'Should have success metrics');
    
    // Should have resource links
    assert.ok(plan.includes('Additional Resources'), 'Should have resources section');
  });
});

