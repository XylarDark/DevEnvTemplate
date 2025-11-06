#!/usr/bin/env node

/**
 * Impact Analyzer
 *
 * Predicts which files/modules will be affected by a proposed change
 * using semantic analysis of the context contract and codebase.
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const { Command } = require('commander');

class ImpactAnalyzer {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.affectedFiles = new Set();
    this.affectedModules = new Set();
    this.confidence = {
      high: [],
      medium: [],
      low: []
    };
  }

  async run() {
    const program = new Command()
      .name('impact-analyze')
      .description('Analyze potential impact of changes described in Context Contract')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .option('-o, --output <file>', 'Output file for impact analysis')
      .option('--json', 'Output in JSON format')
      .parse();

    const options = program.opts();

    try {
      console.log('🎯 Impact Analyzer\n');

      const contextContract = await this.loadContextContract(options.ctx);
      await this.analyzeImpact(contextContract);
      this.displayResults();

      if (options.output) {
        await this.saveResults(options.output, options.json);
      }

    } catch (error) {
      console.error('❌ Impact analysis failed:', error.message);
      process.exit(1);
    }
  }

  async loadContextContract(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load context contract: ${error.message}`);
    }
  }

  async analyzeImpact(contract) {
    console.log('🔍 Analyzing potential impact...\n');

    // Extract keywords and concepts from contract
    const keywords = this.extractKeywords(contract);

    // Analyze different parts of the codebase
    await this.analyzeWebsiteCode(keywords);
    await this.analyzeScripts(keywords);
    await this.analyzeConfiguration(keywords);
    await this.analyzeDocumentation(keywords);

    // Apply domain knowledge rules
    await this.applyDomainRules(contract);

    console.log('✅ Impact analysis complete\n');
  }

  extractKeywords(contract) {
    const keywords = new Set();

    // Extract from problem statement
    if (contract.problem?.statement) {
      this.extractWords(contract.problem.statement, keywords);
    }

    // Extract from goals
    if (contract.goals) {
      for (const goal of contract.goals) {
        this.extractWords(goal.description, keywords);
      }
    }

    // Extract from constraints
    if (contract.constraints) {
      for (const constraint of contract.constraints) {
        this.extractWords(constraint.description, keywords);
      }
    }

    // Extract technical terms
    this.extractTechnicalTerms(contract, keywords);

    return Array.from(keywords);
  }

  extractWords(text, keywords) {
    if (!text) return;

    // Split on common delimiters and filter
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));

    for (const word of words) {
      keywords.add(word);
    }
  }

  extractTechnicalTerms(contract, keywords) {
    // Add domain-specific terms that might not be in natural language
    const technicalTerms = [
      'api', 'route', 'component', 'schema', 'validation',
      'authentication', 'authorization', 'database', 'cache',
      'deployment', 'build', 'test', 'ci', 'cd', 'pipeline'
    ];

    for (const term of technicalTerms) {
      if (this.contractContains(contract, term)) {
        keywords.add(term);
      }
    }
  }

  contractContains(contract, term) {
    const contractText = JSON.stringify(contract).toLowerCase();
    return contractText.includes(term.toLowerCase());
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'an', 'a', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those'
    ]);
    return stopWords.has(word);
  }

  async analyzeWebsiteCode(keywords) {
    console.log('   📱 Analyzing website code...');

    const websiteDir = path.join(this.rootDir, 'website');
    const patterns = [
      'website/**/*.ts',
      'website/**/*.tsx',
      'website/**/*.js',
      'website/**/*.jsx'
    ];

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      for (const file of files) {
        await this.analyzeFile(file, keywords, 'medium');
      }
    }
  }

  async analyzeScripts(keywords) {
    console.log('   ⚙️  Analyzing scripts...');

    const scriptFiles = await glob('scripts/**/*.js', { cwd: this.rootDir });
    for (const file of scriptFiles) {
      await this.analyzeFile(file, keywords, 'high');
    }
  }

  async analyzeConfiguration(keywords) {
    console.log('   ⚙️  Analyzing configuration...');

    const configFiles = await glob('config/**/*.{json,yaml,yml}', { cwd: this.rootDir });
    for (const file of configFiles) {
      await this.analyzeFile(file, keywords, 'high');
    }
  }

  async analyzeDocumentation(keywords) {
    console.log('   📚 Analyzing documentation...');

    const docFiles = await glob('docs/**/*.{md,mdx}', { cwd: this.rootDir });
    for (const file of docFiles) {
      await this.analyzeFile(file, keywords, 'low');
    }
  }

  async analyzeFile(filePath, keywords, defaultConfidence) {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const contentLower = content.toLowerCase();

      let matches = 0;
      let confidence = defaultConfidence;

      // Count keyword matches
      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          matches++;
        }
      }

      // Adjust confidence based on matches
      if (matches >= 3) {
        confidence = 'high';
      } else if (matches >= 1) {
        confidence = 'medium';
      } else {
        return; // No matches, skip
      }

      // Check for file-specific patterns
      if (this.isApiRoute(filePath) && this.contractMentionsApi(keywords)) {
        confidence = 'high';
      }

      if (this.isComponent(filePath) && this.contractMentionsUI(keywords)) {
        confidence = 'high';
      }

      this.affectedFiles.add(filePath);
      this.confidence[confidence].push({
        file: filePath,
        matches,
        reason: `${matches} keyword matches`
      });

    } catch (error) {
      // Skip files that can't be read
    }
  }

  async applyDomainRules(contract) {
    // Apply DevEnvTemplate-specific impact rules

    // If changing manifests, affect agent scripts
    if (this.contractMentionsManifest(contract)) {
      const agentFiles = await glob('scripts/agent/**/*.js', { cwd: this.rootDir });
      for (const file of agentFiles) {
        this.affectedFiles.add(file);
        this.confidence.high.push({
          file,
          matches: 1,
          reason: 'manifest-related change'
        });
      }
    }

    // If changing UI, affect website
    if (this.contractMentionsUI(contract)) {
      this.affectedFiles.add('website/app/page.tsx');
      this.affectedFiles.add('website/app/advanced/page.tsx');
      this.confidence.high.push({
        file: 'website/app/page.tsx',
        matches: 1,
        reason: 'UI-related change'
      });
    }

    // If changing deployment, affect deploy scripts
    if (this.contractMentionsDeployment(contract)) {
      const deployFiles = await glob('scripts/deploy/**/*.js', { cwd: this.rootDir });
      for (const file of deployFiles) {
        this.affectedFiles.add(file);
        this.confidence.high.push({
          file,
          matches: 1,
          reason: 'deployment-related change'
        });
      }
    }
  }

  contractMentionsManifest(contract) {
    const text = JSON.stringify(contract).toLowerCase();
    return text.includes('manifest') || text.includes('schema') || text.includes('validation');
  }

  contractMentionsUI(keywords) {
    return keywords.some(k => ['ui', 'interface', 'component', 'form', 'page'].includes(k));
  }

  contractMentionsApi(keywords) {
    return keywords.some(k => ['api', 'endpoint', 'route', 'server'].includes(k));
  }

  contractMentionsDeployment(contract) {
    const text = JSON.stringify(contract).toLowerCase();
    return text.includes('deploy') || text.includes('build') || text.includes('release');
  }

  isApiRoute(filePath) {
    return filePath.includes('/api/') && filePath.endsWith('/route.ts');
  }

  isComponent(filePath) {
    return filePath.includes('/components/') && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'));
  }

  displayResults() {
    console.log('📊 IMPACT ANALYSIS RESULTS\n');

    console.log(`📁 Files potentially affected: ${this.affectedFiles.size}`);
    console.log(`🎯 High confidence: ${this.confidence.high.length}`);
    console.log(`🎯 Medium confidence: ${this.confidence.medium.length}`);
    console.log(`🎯 Low confidence: ${this.confidence.low.length}\n`);

    if (this.confidence.high.length > 0) {
      console.log('🔴 HIGH CONFIDENCE:');
      for (const item of this.confidence.high) {
        console.log(`  • ${item.file} (${item.reason})`);
      }
      console.log();
    }

    if (this.confidence.medium.length > 0) {
      console.log('🟡 MEDIUM CONFIDENCE:');
      for (const item of this.confidence.medium) {
        console.log(`  • ${item.file} (${item.reason})`);
      }
      console.log();
    }

    if (this.confidence.low.length > 0) {
      console.log('🟢 LOW CONFIDENCE:');
      for (const item of this.confidence.low) {
        console.log(`  • ${item.file} (${item.reason})`);
      }
      console.log();
    }

    console.log('💡 Note: This analysis is predictive. Actual changes may vary.');
    console.log('   Review the predicted files before implementing changes.');
  }

  async saveResults(outputPath, jsonFormat = false) {
    const results = {
      summary: {
        totalFiles: this.affectedFiles.size,
        highConfidence: this.confidence.high.length,
        mediumConfidence: this.confidence.medium.length,
        lowConfidence: this.confidence.low.length
      },
      affectedFiles: Array.from(this.affectedFiles),
      confidenceBreakdown: this.confidence,
      generatedAt: new Date().toISOString()
    };

    if (jsonFormat) {
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    } else {
      // Generate markdown report
      let markdown = '# Impact Analysis Report\n\n';
      markdown += `Generated: ${results.generatedAt}\n\n`;
      markdown += `## Summary\n\n`;
      markdown += `- Total affected files: ${results.summary.totalFiles}\n`;
      markdown += `- High confidence: ${results.summary.highConfidence}\n`;
      markdown += `- Medium confidence: ${results.summary.mediumConfidence}\n`;
      markdown += `- Low confidence: ${results.summary.lowConfidence}\n\n`;

      if (results.confidenceBreakdown.high.length > 0) {
        markdown += '## High Confidence Files\n\n';
        for (const item of results.confidenceBreakdown.high) {
          markdown += `- \`${item.file}\` - ${item.reason}\n`;
        }
        markdown += '\n';
      }

      await fs.writeFile(outputPath, markdown);
    }

    console.log(`💾 Results saved to: ${outputPath}`);
  }
}

// Run the impact analyzer
if (require.main === module) {
  const analyzer = new ImpactAnalyzer();
  analyzer.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = ImpactAnalyzer;
