#!/usr/bin/env node

/**
 * Impact Predictor Tool - CI-only utility
 *
 * Analyzes context contracts to predict which files will be affected by implementation.
 * Used by DevEnvTemplate CI to validate actual changes against plan predictions.
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

class ImpactPredictor {
  constructor() {
    this.rootDir = process.cwd();
    this.predictions = [];
  }

  async predictImpact(contractFile) {
    console.log(`🎯 Predicting impact for ${contractFile}...`);

    try {
      const contractContent = await fs.readFile(contractFile, 'utf8');
      const contract = JSON.parse(contractContent);

      // Extract key information from contract
      const context = {
        problem: contract.problem?.statement || '',
        goals: contract.goals?.map(g => g.description).join(' ') || '',
        constraints: contract.constraints?.map(c => c.description).join(' ') || '',
        acceptanceTests: contract.acceptanceTests?.map(t => t.description).join(' ') || ''
      };

      // Generate predictions based on contract content
      const predictions = await this.generatePredictions(context);

      return {
        contractId: contract.id || path.basename(contractFile, '.json'),
        predictedFiles: predictions,
        riskLevel: this.assessRiskLevel(predictions),
        rationale: this.generateRationale(context, predictions)
      };
    } catch (error) {
      console.error(`❌ Failed to predict impact for ${contractFile}: ${error.message}`);
      return {
        contractId: path.basename(contractFile, '.json'),
        predictedFiles: [],
        riskLevel: 'unknown',
        rationale: `Error analyzing contract: ${error.message}`
      };
    }
  }

  async generatePredictions(context) {
    const predictions = new Set();

    // Extract keywords that might indicate file types or areas
    const content = `${context.problem} ${context.goals} ${context.constraints} ${context.acceptanceTests}`.toLowerCase();

    // Common patterns to look for
    const patterns = {
      // Component/UI patterns
      components: /\b(component|ui|view|page|screen|modal|form|button|input|select|dropdown)\b/,
      // API patterns
      api: /\b(api|endpoint|route|controller|service|handler|middleware)\b/,
      // Database patterns
      database: /\b(database|db|model|schema|migration|query|repository)\b/,
      // Configuration patterns
      config: /\b(config|configuration|setting|environment|env)\b/,
      // Authentication patterns
      auth: /\b(auth|login|logout|user|session|token|password|security)\b/,
      // Testing patterns
      test: /\b(test|spec|e2e|integration|unit)\b/,
      // Documentation patterns
      docs: /\b(doc|readme|documentation|guide)\b/
    };

    // Directory patterns to search
    const dirPatterns = {
      components: 'src/components/**',
      api: 'src/{api,routes,pages/api}/**',
      database: 'src/{models,schemas,database}/**',
      config: '{config,src/config}/**',
      auth: 'src/{auth,security,lib/auth}/**',
      test: '{tests,src/**/__tests__,src/**/__specs__}/**',
      docs: '{docs,README.md,CHANGELOG.md}'
    };

    // Check each pattern and add relevant directories
    for (const [key, regex] of Object.entries(patterns)) {
      if (regex.test(content)) {
        const dirs = await this.findDirectories(dirPatterns[key]);
        dirs.forEach(dir => predictions.add(dir));
      }
    }

    // Look for specific file mentions in content
    const fileMentions = content.match(/\b[a-zA-Z0-9_-]+\.[a-zA-Z]+\b/g) || [];
    fileMentions.forEach(mention => {
      if (mention.includes('.js') || mention.includes('.ts') || mention.includes('.tsx') || mention.includes('.jsx')) {
        predictions.add(`src/**/${mention}`);
      }
    });

    // Always include some baseline files that are commonly modified
    const baselineFiles = [
      'package.json',
      'README.md',
      '.gitignore'
    ];

    baselineFiles.forEach(file => {
      if (await this.fileExists(file)) {
        predictions.add(file);
      }
    });

    return Array.from(predictions).sort();
  }

  async findDirectories(pattern) {
    try {
      const dirs = await glob(pattern, {
        cwd: this.rootDir,
        onlyDirectories: true,
        ignore: ['node_modules/**', '.git/**']
      });
      return dirs;
    } catch (error) {
      return [];
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(path.join(this.rootDir, filePath));
      return true;
    } catch {
      return false;
    }
  }

  assessRiskLevel(predictions) {
    const count = predictions.length;

    if (count === 0) return 'low';
    if (count <= 3) return 'low';
    if (count <= 7) return 'medium';
    if (count <= 15) return 'high';
    return 'critical';
  }

  generateRationale(context, predictions) {
    const parts = [];

    if (predictions.length === 0) {
      return 'No specific files predicted - manual review recommended';
    }

    // Analyze what drove the predictions
    const content = `${context.problem} ${context.goals}`.toLowerCase();

    if (/\b(component|ui|view)\b/.test(content)) {
      parts.push('UI components identified');
    }

    if (/\b(api|endpoint)\b/.test(content)) {
      parts.push('API endpoints identified');
    }

    if (/\b(database|model)\b/.test(content)) {
      parts.push('Database models identified');
    }

    if (/\b(config|setting)\b/.test(content)) {
      parts.push('Configuration changes identified');
    }

    if (/\b(auth|login|security)\b/.test(content)) {
      parts.push('Authentication/security changes identified');
    }

    if (/\b(test)\b/.test(content)) {
      parts.push('Testing changes identified');
    }

    const rationale = parts.length > 0
      ? `Prediction based on: ${parts.join(', ')}`
      : 'Prediction based on general development patterns';

    return `${rationale}. ${predictions.length} files/directories predicted to change.`;
  }

  async predictMultipleContracts(contractFiles) {
    const results = [];

    for (const file of contractFiles) {
      const result = await this.predictImpact(file);
      results.push(result);
    }

    return results;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node impact-predictor.js <contract-file1> [<contract-file2> ...]');
    process.exit(1);
  }

  const predictor = new ImpactPredictor();
  const results = await predictor.predictMultipleContracts(args);

  // Output JSON for CI consumption
  console.log(JSON.stringify(results, null, 2));
}

// Export for testing
if (require.main === module) {
  main().catch(error => {
    console.error('Impact prediction failed:', error);
    process.exit(1);
  });
}

module.exports = ImpactPredictor;
