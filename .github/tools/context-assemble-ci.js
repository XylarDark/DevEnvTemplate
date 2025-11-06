#!/usr/bin/env node

/**
 * CI Context Pack Assembler - CI-only utility
 *
 * Generates minimal .contextpack artifact for Cursor Plan Mode.
 * Curates relevant files and documentation for LLM consumption.
 */

const fs = require('fs').promises;
const path = require('path');

class CIContextAssembler {
  constructor() {
    this.rootDir = process.cwd();
    this.outputDir = '.contextpack';
    this.maxSizeKB = 100; // Minimal size for CI artifact
    this.currentSize = 0;
  }

  async assemble(contextFiles, stackReport) {
    console.log('📦 Assembling minimal context pack for Plan Mode...');

    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });

    const contextPack = {
      metadata: {
        assembledAt: new Date().toISOString(),
        profile: 'ci-minimal',
        maxSizeKB: this.maxSizeKB,
        totalSizeKB: 0,
        fileCount: 0,
        purpose: 'Cursor Plan Mode context'
      },
      files: [],
      references: []
    };

    try {
      // Add stack intelligence
      if (stackReport) {
        await this.addFile(contextPack, '.devenv/stack-report.json', 'stack-report.json');
      }

      // Add gaps analysis if available
      try {
        await this.addFile(contextPack, '.devenv/gaps-report.md', 'gaps-report.md');
      } catch {
        // Gaps report may not exist
      }

      // Add project rules
      await this.addFile(contextPack, '.projectrules', 'projectrules');

      // Add engineering handbook (key sections)
      await this.addFile(contextPack, 'docs/engineering-handbook.md', 'engineering-handbook.md');

      // Add README
      await this.addFile(contextPack, 'README.md', 'README.md');

      // Add context contracts
      for (const contractFile of contextFiles || []) {
        const filename = path.basename(contractFile);
        await this.addFile(contextPack, contractFile, `contracts/${filename}`);
      }

      // Add schema definitions
      await this.addFile(contextPack, 'schemas/context-contract.schema.json', 'schemas/context-contract.schema.json');

      // Create index file
      const indexContent = this.generateIndex(contextPack);
      await fs.writeFile(path.join(this.outputDir, 'index.md'), indexContent, 'utf8');
      contextPack.metadata.fileCount++;
      contextPack.files.push({
        originalPath: 'generated',
        packPath: 'index.md',
        sizeKB: this.getFileSize(indexContent),
        type: 'index'
      });

    } catch (error) {
      console.warn(`⚠️ Context pack assembly partially failed: ${error.message}`);
    }

    // Update metadata
    contextPack.metadata.totalSizeKB = this.currentSize;
    contextPack.metadata.fileCount = contextPack.files.length;

    // Write metadata
    await fs.writeFile(
      path.join(this.outputDir, 'metadata.json'),
      JSON.stringify(contextPack.metadata, null, 2),
      'utf8'
    );

    console.log(`✅ Context pack assembled: ${contextPack.metadata.fileCount} files, ${contextPack.metadata.totalSizeKB}KB`);
    return contextPack;
  }

  async addFile(contextPack, sourcePath, packPath) {
    try {
      const fullSourcePath = path.join(this.rootDir, sourcePath);

      // Check if file exists
      await fs.access(fullSourcePath);

      // Check size limit
      const stats = await fs.stat(fullSourcePath);
      const sizeKB = stats.size / 1024;

      if (this.currentSize + sizeKB > this.maxSizeKB) {
        console.log(`⚠️ Skipping ${sourcePath} - would exceed size limit`);
        return;
      }

      // Copy file
      const packFullPath = path.join(this.outputDir, packPath);
      await fs.mkdir(path.dirname(packFullPath), { recursive: true });
      await fs.copyFile(fullSourcePath, packFullPath);

      // Update tracking
      this.currentSize += sizeKB;
      contextPack.files.push({
        originalPath: sourcePath,
        packPath: packPath,
        sizeKB: Math.round(sizeKB * 100) / 100,
        type: this.getFileType(sourcePath)
      });

    } catch (error) {
      console.log(`⚠️ Could not add ${sourcePath}: ${error.message}`);
    }
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.md': 'documentation',
      '.json': 'configuration',
      '.js': 'code',
      '.ts': 'code',
      '.tsx': 'code',
      '.jsx': 'code',
      '.py': 'code',
      '.go': 'code',
      '.java': 'code',
      '.cs': 'code'
    };
    return types[ext] || 'other';
  }

  getFileSize(content) {
    return Math.round((Buffer.byteLength(content, 'utf8') / 1024) * 100) / 100;
  }

  generateIndex(contextPack) {
    let index = '# DevEnvTemplate Context Pack\n\n';
    index += `Generated: ${contextPack.metadata.assembledAt}\n\n`;
    index += `Files: ${contextPack.metadata.fileCount} | Size: ${contextPack.metadata.totalSizeKB}KB\n\n`;
    index += '## Contents\n\n';

    // Group files by type
    const byType = {};
    contextPack.files.forEach(file => {
      if (!byType[file.type]) byType[file.type] = [];
      byType[file.type].push(file);
    });

    Object.entries(byType).forEach(([type, files]) => {
      index += `### ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
      files.forEach(file => {
        index += `- [\`${file.packPath}\`](${file.packPath}) (${file.sizeKB}KB)\n`;
      });
      index += '\n';
    });

    index += '## Usage\n\n';
    index += 'This context pack contains curated information for Cursor Plan Mode:\n\n';
    index += '- **stack-report.json**: Detected technology stack and configurations\n';
    index += '- **gaps-report.md**: Areas identified for improvement\n';
    index += '- **projectrules**: Governance and quality standards\n';
    index += '- **engineering-handbook.md**: Architecture and development guidelines\n';
    index += '- **contracts/**: Context contracts defining requirements\n';
    index += '- **schemas/**: JSON schemas for validation\n\n';

    index += 'Use this context when planning changes to ensure alignment with DevEnvTemplate standards.\n\n';

    return index;
  }
}

// CLI interface for CI
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node context-assemble-ci.js [context-files...]');
    process.exit(1);
  }

  const assembler = new CIContextAssembler();

  // Try to load stack report
  let stackReport = null;
  try {
    const stackContent = await fs.readFile('.devenv/stack-report.json', 'utf8');
    stackReport = JSON.parse(stackContent);
  } catch {
    // Stack report may not exist
  }

  await assembler.assemble(args, stackReport);
  console.log('Context pack ready for Plan Mode');
}

// Export for testing
if (require.main === module) {
  main().catch(error => {
    console.error('Context pack assembly failed:', error);
    process.exit(1);
  });
}

module.exports = CIContextAssembler;
