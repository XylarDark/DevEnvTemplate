#!/usr/bin/env node

/**
 * Context Pack Assembler
 *
 * Builds curated context packs containing only the most relevant files
 * and information for LLM consumption, respecting token limits.
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const archiver = require('archiver');
const { Command } = require('commander');

class ContextAssembler {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.maxSizeKB = 500; // Default context pack size limit
    this.profiles = {
      small: {
        maxSizeKB: 200,
        description: 'Minimal context for focused tasks',
        includeCore: false,
        includeSnippets: false,
        includeDocs: false
      },
      medium: {
        maxSizeKB: 500,
        description: 'Balanced context for most tasks',
        includeCore: true,
        includeSnippets: true,
        includeDocs: false
      },
      large: {
        maxSizeKB: 1000,
        description: 'Comprehensive context for complex tasks',
        includeCore: true,
        includeSnippets: true,
        includeDocs: true
      }
    };
  }

  listProfiles() {
    console.log('📦 Available Context Pack Profiles:\n');

    Object.entries(this.profiles).forEach(([name, profile]) => {
      console.log(`🔧 ${name.toUpperCase()}:`);
      console.log(`   ${profile.description}`);
      console.log(`   Size limit: ${profile.maxSizeKB}KB`);
      console.log(`   Includes core files: ${profile.includeCore ? '✅' : '❌'}`);
      console.log(`   Includes code snippets: ${profile.includeSnippets ? '✅' : '❌'}`);
      console.log(`   Includes documentation: ${profile.includeDocs ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('💡 Usage:');
    console.log('   npm run agent:context -c contract.json -p small    # Minimal context');
    console.log('   npm run agent:context -c contract.json -p medium  # Balanced (default)');
    console.log('   npm run agent:context -c contract.json -p large   # Comprehensive');
    console.log('   npm run agent:context --list-profiles             # Show this help');
  }

  async run() {
    const program = new Command()
      .name('context-assemble')
      .description('Build curated context pack for LLM consumption')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .option('-o, --output <dir>', 'Output directory for context pack', '.contextpack')
      .option('-p, --profile <name>', 'Context pack profile (small/medium/large)', 'medium')
      .option('--max-size <kb>', 'Maximum pack size in KB (overrides profile)')
      .option('--list-profiles', 'List available context pack profiles');

    program.parse();

    const options = program.opts();

    // Handle --list-profiles
    if (options.listProfiles) {
      this.listProfiles();
      return;
    }

    try {
      console.log('📦 Context Pack Assembler\n');

      // Apply profile settings
      const profile = this.profiles[options.profile];
      if (!profile) {
        throw new Error(`Unknown profile: ${options.profile}. Available: ${Object.keys(this.profiles).join(', ')}`);
      }

      console.log(`🔧 Using profile: ${options.profile} (${profile.description})`);

      // Set size limit (command line override takes precedence)
      this.maxSizeKB = options.maxSize ? parseInt(options.maxSize) : profile.maxSizeKB;
      this.profileSettings = profile;

      const contextContract = await this.loadContextContract(options.ctx);

      const contextPack = await this.assembleContextPack(contextContract);
      await this.saveContextPack(contextPack, options.output);

      console.log(`✅ Context pack assembled: ${options.output}`);
      console.log(`📊 Size: ${contextPack.metadata.totalSizeKB}KB (${contextPack.metadata.fileCount} files)`);

    } catch (error) {
      console.error('❌ Context pack assembly failed:', error.message);
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

  async assembleContextPack(contract) {
    console.log('🔨 Assembling context pack...\n');

    const contextPack = {
      metadata: {
        contextContractId: contract.id,
        assembledAt: new Date().toISOString(),
        profile: this.profileSettings,
        maxSizeKB: this.maxSizeKB,
        totalSizeKB: 0,
        fileCount: 0
      },
      contextContract: contract,
      files: [],
      snippets: [],
      references: []
    };

    // Include core files (if enabled by profile)
    if (this.profileSettings.includeCore) {
      await this.addCoreFiles(contextPack);
    }

    // Include contract-specific files
    await this.addContractSpecificFiles(contextPack, contract);

    // Add curated snippets (if enabled by profile)
    if (this.profileSettings.includeSnippets) {
      await this.addCuratedSnippets(contextPack, contract);
    }

    // Add documentation references (if enabled by profile)
    if (this.profileSettings.includeDocs) {
      await this.addDocumentationReferences(contextPack, contract);
    }

    // Enforce size limits
    await this.enforceSizeLimits(contextPack);

    return contextPack;
  }

  async addCoreFiles(contextPack) {
    console.log('   📄 Adding core files...');

    const coreFiles = [
      'schemas/project.manifest.schema.json',
      'schemas/context-contract.schema.json',
      'docs/engineering-handbook.md',
      'IMPLEMENTATION_GUIDE.md'
    ];

    for (const file of coreFiles) {
      await this.addFileToPack(contextPack, file, 'core');
    }
  }

  async addContractSpecificFiles(contextPack, contract) {
    console.log('   🎯 Adding contract-specific files...');

    // Files explicitly mentioned in contract
    if (contract.scope?.boundaries?.technical?.files) {
      for (const filePattern of contract.scope.boundaries.technical.files) {
        await this.addFilesByPattern(contextPack, filePattern, 'contract-specified');
      }
    }

    // API routes if contract mentions APIs
    if (this.contractMentions(contract, ['api', 'endpoint', 'route'])) {
      await this.addFilesByPattern(contextPack, 'website/app/api/**/*.ts', 'api-routes');
    }

    // UI components if contract mentions UI
    if (this.contractMentions(contract, ['ui', 'component', 'interface', 'form'])) {
      await this.addFilesByPattern(contextPack, 'website/components/**/*.tsx', 'ui-components');
    }

    // Configuration if contract mentions config
    if (this.contractMentions(contract, ['config', 'configuration', 'settings'])) {
      await this.addFilesByPattern(contextPack, 'config/**/*.{json,yaml,yml}', 'configuration');
    }

    // Scripts if contract mentions automation
    if (this.contractMentions(contract, ['script', 'automation', 'deploy'])) {
      await this.addFilesByPattern(contextPack, 'scripts/**/*.js', 'scripts');
    }
  }

  async addCuratedSnippets(contextPack, contract) {
    console.log('   ✂️  Adding curated snippets...');

    const keywords = this.extractKeywords(contract);

    // Find relevant code snippets
    const snippetFiles = await glob('**/*.{ts,tsx,js,jsx}', {
      cwd: this.rootDir,
      ignore: ['node_modules/**', '.next/**', 'dist/**']
    });

    for (const file of snippetFiles) {
      if (contextPack.metadata.totalSizeKB >= this.maxSizeKB * 0.8) break; // Reserve space

      const content = await fs.readFile(path.join(this.rootDir, file), 'utf8');
      const relevantSnippets = this.extractRelevantSnippets(content, keywords, file);

      for (const snippet of relevantSnippets) {
        if (contextPack.metadata.totalSizeKB + this.estimateSnippetSize(snippet) > this.maxSizeKB) break;

        contextPack.snippets.push(snippet);
        contextPack.metadata.totalSizeKB += this.estimateSnippetSize(snippet);
      }
    }
  }

  async addDocumentationReferences(contextPack, contract) {
    console.log('   📚 Adding documentation references...');

    const docs = await glob('docs/**/*.md', { cwd: this.rootDir });

    for (const doc of docs) {
      const content = await fs.readFile(path.join(this.rootDir, doc), 'utf8');
      const relevance = this.calculateDocRelevance(content, contract);

      if (relevance > 0.3) { // Only include relevant docs
        contextPack.references.push({
          file: doc,
          relevance: relevance,
          sections: this.extractRelevantSections(content, contract)
        });
      }
    }
  }

  async enforceSizeLimits(contextPack) {
    console.log('   ⚖️  Enforcing size limits...');

    // Sort files by importance and remove least important if over limit
    contextPack.files.sort((a, b) => {
      const priorityOrder = { 'contract-specified': 3, 'core': 2, 'api-routes': 2, 'ui-components': 1, 'other': 0 };
      return (priorityOrder[b.category] || 0) - (priorityOrder[a.category] || 0);
    });

    while (contextPack.metadata.totalSizeKB > this.maxSizeKB && contextPack.files.length > 1) {
      const removed = contextPack.files.pop();
      contextPack.metadata.totalSizeKB -= removed.sizeKB;
      console.log(`   Removed ${removed.path} to stay within size limit`);
    }

    // Similar for snippets
    contextPack.snippets.sort((a, b) => b.relevance - a.relevance);
    while (contextPack.metadata.totalSizeKB > this.maxSizeKB && contextPack.snippets.length > 0) {
      const removed = contextPack.snippets.pop();
      contextPack.metadata.totalSizeKB -= this.estimateSnippetSize(removed);
    }
  }

  async addFileToPack(contextPack, filePath, category = 'other') {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      const stats = await fs.stat(fullPath);
      const sizeKB = Math.ceil(stats.size / 1024);

      if (contextPack.metadata.totalSizeKB + sizeKB > this.maxSizeKB) {
        console.log(`   Skipping ${filePath} (would exceed size limit)`);
        return;
      }

      const content = await fs.readFile(fullPath, 'utf8');

      contextPack.files.push({
        path: filePath,
        category,
        sizeKB,
        content,
        lastModified: stats.mtime.toISOString()
      });

      contextPack.metadata.totalSizeKB += sizeKB;
      contextPack.metadata.fileCount++;

    } catch (error) {
      // Skip files that can't be read
    }
  }

  async addFilesByPattern(contextPack, pattern, category) {
    const files = await glob(pattern, { cwd: this.rootDir });
    for (const file of files) {
      await this.addFileToPack(contextPack, file, category);
    }
  }

  contractMentions(contract, keywords) {
    const contractText = JSON.stringify(contract).toLowerCase();
    return keywords.some(keyword => contractText.includes(keyword));
  }

  extractKeywords(contract) {
    const keywords = new Set();

    // Extract from goals and problem
    [contract.problem?.statement, ...(contract.goals?.map(g => g.description) || [])]
      .filter(Boolean)
      .forEach(text => {
        const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        words.forEach(word => keywords.add(word));
      });

    return Array.from(keywords);
  }

  extractRelevantSnippets(content, keywords, filePath) {
    const snippets = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const keywordMatches = keywords.filter(k => line.toLowerCase().includes(k)).length;

      if (keywordMatches > 0) {
        // Extract snippet around this line
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        const snippet = lines.slice(start, end).join('\n');

        snippets.push({
          file: filePath,
          lineNumber: i + 1,
          content: snippet,
          relevance: keywordMatches / keywords.length,
          keywords: keywords.filter(k => line.toLowerCase().includes(k))
        });
      }
    }

    return snippets.slice(0, 3); // Limit snippets per file
  }

  estimateSnippetSize(snippet) {
    return Math.ceil(JSON.stringify(snippet).length / 1024);
  }

  calculateDocRelevance(content, contract) {
    const keywords = this.extractKeywords(contract);
    const contentLower = content.toLowerCase();
    const matches = keywords.filter(k => contentLower.includes(k)).length;
    return matches / keywords.length;
  }

  extractRelevantSections(content, contract) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('#')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          level: line.match(/^#+/)[0].length,
          startLine: i + 1,
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    // Filter to most relevant sections
    return sections
      .filter(section => this.calculateDocRelevance(section.content, contract) > 0.2)
      .slice(0, 3);
  }

  async saveContextPack(contextPack, outputDir) {
    const outputPath = path.resolve(outputDir);

    // Create directory
    await fs.mkdir(outputPath, { recursive: true });

    // Save metadata
    await fs.writeFile(
      path.join(outputPath, 'metadata.json'),
      JSON.stringify(contextPack.metadata, null, 2)
    );

    // Save context contract
    await fs.writeFile(
      path.join(outputPath, 'context-contract.json'),
      JSON.stringify(contextPack.contextContract, null, 2)
    );

    // Save files
    const filesDir = path.join(outputPath, 'files');
    await fs.mkdir(filesDir, { recursive: true });

    for (const file of contextPack.files) {
      const filePath = path.join(filesDir, file.path.replace(/\//g, '__'));
      await fs.writeFile(filePath, file.content);
    }

    // Save snippets
    if (contextPack.snippets.length > 0) {
      await fs.writeFile(
        path.join(outputPath, 'snippets.json'),
        JSON.stringify(contextPack.snippets, null, 2)
      );
    }

    // Save references
    if (contextPack.references.length > 0) {
      await fs.writeFile(
        path.join(outputPath, 'references.json'),
        JSON.stringify(contextPack.references, null, 2)
      );
    }

    // Create ZIP archive
    await this.createZipArchive(contextPack, outputPath);
  }

  async createZipArchive(contextPack, outputDir) {
    const zipPath = path.join(path.dirname(outputDir), `${path.basename(outputDir)}.zip`);
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`   📦 ZIP archive created: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Add all files from context pack directory
      archive.directory(outputDir, false);

      archive.finalize();
    });
  }
}

// Run the context assembler
if (require.main === module) {
  const assembler = new ContextAssembler();
  assembler.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = ContextAssembler;
