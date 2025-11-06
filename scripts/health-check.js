#!/usr/bin/env node

/**
 * Repository Structure Health Check
 *
 * Validates that the repository follows the expected folder structure
 * and reports any issues or missing files.
 */

const fs = require('fs');
const path = require('path');

class RepoHealthCheck {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.errors = [];
    this.warnings = [];
    this.issues = 0;
  }

  log(message, type = 'info') {
    const prefix = {
      info: 'ℹ️ ',
      success: '✅',
      warning: '⚠️ ',
      error: '❌'
    }[type] || '';

    console.log(`${prefix} ${message}`);
  }

  checkFileExists(filePath, description, severity = 'error') {
    const fullPath = path.join(this.rootDir, filePath);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      const message = `Missing ${description}: ${filePath}`;
      if (severity === 'error') {
        this.errors.push(message);
        this.issues++;
      } else {
        this.warnings.push(message);
      }
      this.log(message, severity);
      return false;
    }

    this.log(`${description} found`, 'success');
    return true;
  }

  checkDirectoryExists(dirPath, description, severity = 'error') {
    const fullPath = path.join(this.rootDir, dirPath);
    let exists = false;

    try {
      const stat = fs.statSync(fullPath);
      exists = stat.isDirectory();
    } catch (err) {
      exists = false;
    }

    if (!exists) {
      const message = `Missing ${description}: ${dirPath}`;
      if (severity === 'error') {
        this.errors.push(message);
        this.issues++;
      } else {
        this.warnings.push(message);
      }
      this.log(message, severity);
      return false;
    }

    this.log(`${description} found`, 'success');
    return true;
  }

  checkFileContent(filePath, checks, description) {
    const fullPath = path.join(this.rootDir, filePath);

    if (!fs.existsSync(fullPath)) {
      this.log(`Cannot check ${description}: ${filePath} does not exist`, 'warning');
      return false;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const check of checks) {
        const { pattern, shouldContain, message } = check;

        if (shouldContain) {
          if (!content.includes(pattern)) {
            this.errors.push(`${message}: ${filePath}`);
            this.issues++;
            this.log(`${message}: ${filePath}`, 'error');
            return false;
          }
        } else {
          if (content.includes(pattern)) {
            this.warnings.push(`${message}: ${filePath}`);
            this.log(`${message}: ${filePath}`, 'warning');
          }
        }
      }

      this.log(`${description} content validated`, 'success');
      return true;
    } catch (err) {
      this.errors.push(`Failed to read ${filePath}: ${err.message}`);
      this.issues++;
      this.log(`Failed to read ${filePath}: ${err.message}`, 'error');
      return false;
    }
  }

  runChecks() {
    this.log('🔍 Running DevEnvTemplate repository health check...\n');

    // Core structure checks
    this.checkFileExists('README.md', 'Main README file');
    this.checkFileExists('IMPLEMENTATION_GUIDE.md', 'Implementation guide');
    this.checkFileExists('.projectrules', 'Project governance rules');
    this.checkFileExists('package.json', 'Root package.json');

    // Directory structure
    this.checkDirectoryExists('config', 'Project configuration directory');
    this.checkDirectoryExists('schemas', 'JSON schemas directory');
    this.checkDirectoryExists('packs', 'Template packs directory');
    this.checkDirectoryExists('scripts', 'Automation scripts directory');
    this.checkDirectoryExists('website', 'Next.js onboarding app');
    this.checkDirectoryExists('docs', 'Documentation directory');
    this.checkDirectoryExists('docs/specs', 'Technical specifications');

    // Config files in new locations
    this.checkFileExists('config/cleanup.config.yaml', 'Cleanup configuration (new location)');
    this.checkFileExists('config/quality-budgets.json', 'Quality budgets (new location)');

    // Schema files
    this.checkFileExists('schemas/project.manifest.schema.json', 'Project manifest schema');

    // Website structure
    this.checkDirectoryExists('website/app', 'Next.js app directory');
    this.checkDirectoryExists('website/components', 'React components');
    this.checkDirectoryExists('website/lib', 'Shared utilities');
    this.checkFileExists('website/package.json', 'Website package.json');

    // Scripts structure
    this.checkDirectoryExists('scripts/agent', 'Agent scripts');
    this.checkDirectoryExists('scripts/cleanup', 'Cleanup scripts');
    this.checkFileExists('scripts/utils/path-resolver.js', 'Path resolution utilities');

    // Documentation
    this.checkFileExists('docs/engineering-handbook.md', 'Engineering handbook');
    this.checkFileExists('docs/specs/project-definition-schema-v1.md', 'Project schema spec');

    // Security and compliance
    this.checkFileExists('.github/SECURITY.md', 'Security policy');
    this.checkFileExists('.github/CODE_OF_CONDUCT.md', 'Code of conduct');
    this.checkFileExists('.github/CONTRIBUTING.md', 'Contributing guidelines');
    this.checkFileExists('.github/SUPPORT.md', 'Support guidelines');
    this.checkFileExists('.github/CODEOWNERS', 'Code ownership rules');

    // CI/CD
    this.checkDirectoryExists('.github/workflows', 'GitHub Actions workflows');

    // Check for old structure remnants
    this.checkOldStructure();

    // Content validation
    this.validateContent();

    this.printSummary();
  }

  checkOldStructure() {
    this.log('\n🔄 Checking for old structure remnants...\n');

    // Check if old files still exist (should be removed after migration)
    const oldPaths = [
      'cleanup.config.yaml',  // moved to config/
      'quality-budgets.json',  // moved to config/
      'SECURITY.md',           // moved to .github/
      'CODE_OF_CONDUCT.md',    // moved to .github/
      'CONTRIBUTING.md',       // moved to .github/
      'SUPPORT.md',            // moved to .github/
      'CODEOWNERS'             // moved to .github/
    ];

    for (const oldPath of oldPaths) {
      const fullPath = path.join(this.rootDir, oldPath);
      if (fs.existsSync(fullPath)) {
        this.warnings.push(`Old structure file still exists: ${oldPath} (should be removed after migration)`);
        this.log(`Old structure file still exists: ${oldPath}`, 'warning');
      }
    }

    // Check if website/docs still exists (should be removed)
    if (fs.existsSync(path.join(this.rootDir, 'website/docs'))) {
      this.warnings.push('website/docs/ still exists (should be removed, docs centralized in root)');
      this.log('website/docs/ still exists (should be removed)', 'warning');
    }

    // Check if presets/ still exists alongside packs/
    const presetsPath = path.join(this.rootDir, 'presets');
    const packsPath = path.join(this.rootDir, 'packs');

    if (fs.existsSync(presetsPath) && fs.existsSync(packsPath)) {
      this.log('Both presets/ and packs/ exist (migration in progress)', 'info');
    } else if (fs.existsSync(presetsPath) && !fs.existsSync(packsPath)) {
      this.warnings.push('Only presets/ exists, packs/ should be created');
      this.log('Only presets/ exists, packs/ should be created', 'warning');
    }
  }

  validateContent() {
    this.log('\n📄 Validating file contents...\n');

    // Check package.json for required scripts
    this.checkFileContent('package.json', [
      { pattern: '"agent:init"', shouldContain: true, message: 'Missing agent:init script' },
      { pattern: '"agent:apply"', shouldContain: true, message: 'Missing agent:apply script' },
      { pattern: '"cleanup:dry-run"', shouldContain: true, message: 'Missing cleanup:dry-run script' }
    ], 'Root package.json scripts');

    // Check website package.json
    this.checkFileContent('website/package.json', [
      { pattern: '"dev":', shouldContain: true, message: 'Missing dev script in website' },
      { pattern: '"build":', shouldContain: true, message: 'Missing build script in website' }
    ], 'Website package.json scripts');

    // Check for hardcoded paths that should use path resolver
    this.checkFileContent('scripts/cleanup/engine.js', [
      { pattern: 'resolveConfigPath', shouldContain: true, message: 'Cleanup engine should use resolveConfigPath' }
    ], 'Cleanup engine path resolution');

    this.checkFileContent('scripts/agent/apply.js', [
      { pattern: 'resolvePackPath', shouldContain: true, message: 'Agent apply should use resolvePackPath' }
    ], 'Agent apply path resolution');
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 REPOSITORY HEALTH CHECK SUMMARY');
    console.log('='.repeat(60));

    if (this.errors.length > 0) {
      console.log(`❌ ${this.errors.length} errors found:`);
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warnings:`);
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Repository structure is healthy!');
    }

    console.log(`📊 Total issues: ${this.issues}`);

    if (this.errors.length > 0) {
      console.log('\n💡 Fix errors before proceeding with development.');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      console.log('\n💡 Consider addressing warnings for optimal repository health.');
      process.exit(0);
    } else {
      console.log('\n🎉 All checks passed!');
      process.exit(0);
    }
  }
}

// Run the health check
if (require.main === module) {
  const checker = new RepoHealthCheck();
  checker.runChecks();
}

module.exports = RepoHealthCheck;
