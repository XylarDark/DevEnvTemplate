#!/usr/bin/env node

/**
 * LLM Prompt Builder
 *
 * Constructs optimized prompts for LLM consumption using context contracts,
 * curated context packs, and implementation plans with token budgeting.
 */

const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');

class PromptBuilder {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.maxTokens = 128000; // Conservative limit for GPT-4
    this.tokenBuffer = 0.8; // Use 80% to leave room for response
  }

  async run() {
    const program = new Command()
      .name('prompt-build')
      .description('Build optimized LLM prompt from context and plan')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .requiredOption('-p, --plan <file>', 'Implementation plan markdown file')
      .option('-o, --output <file>', 'Output prompt file')
      .option('--max-tokens <num>', 'Maximum token limit', '128000')
      .option('--format <type>', 'Output format: text, json, or clipboard', 'text')
      .parse();

    const options = program.opts();

    try {
      console.log('🤖 LLM Prompt Builder\n');

      this.maxTokens = parseInt(options.maxTokens);
      const contextContract = await this.loadContextContract(options.ctx);
      const planContent = await this.loadPlan(options.plan);

      const prompt = await this.buildPrompt(contextContract, planContent, options);
      await this.outputPrompt(prompt, options);

      console.log('✅ LLM prompt constructed successfully');
      console.log(`📊 Estimated tokens: ${prompt.metadata.estimatedTokens}`);

    } catch (error) {
      console.error('❌ Prompt building failed:', error.message);
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

  async loadPlan(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      return await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load plan: ${error.message}`);
    }
  }

  async buildPrompt(contract, planContent, options) {
    console.log('🔨 Constructing optimized prompt...\n');

    const prompt = {
      metadata: {
        contextContractId: contract.id,
        generatedAt: new Date().toISOString(),
        estimatedTokens: 0,
        sections: []
      },
      content: ''
    };

    // Add sections in priority order
    await this.addContextContractSection(prompt, contract);
    await this.addImplementationPlanSection(prompt, planContent);
    await this.addAcceptanceCriteriaSection(prompt, contract);
    await this.addAssumptionsSection(prompt, contract);
    await this.addConstraintsSection(prompt, contract);
    await this.addCuratedContextSection(prompt, contract);
    await this.addInstructionsSection(prompt, contract);

    // Estimate token count
    prompt.metadata.estimatedTokens = this.estimateTokenCount(prompt.content);

    return prompt;
  }

  async addContextContractSection(prompt, contract) {
    const section = `## Context Contract

**Problem Statement:** ${contract.problem?.statement || 'Not specified'}

**Goals:**
${contract.goals?.map(g => `- ${g.description} (${g.criteria || 'Criteria TBD'})`).join('\n') || 'None specified'}

**Scope:**
- In Scope: ${contract.scope?.inScope?.join(', ') || 'TBD'}
- Out of Scope: ${contract.scope?.outOfScope?.join(', ') || 'TBD'}

**Business Impact:** ${contract.problem?.impact || 'Not specified'}
`;

    prompt.content += section;
    prompt.metadata.sections.push('context-contract');
  }

  async addImplementationPlanSection(prompt, planContent) {
    // Extract key sections from plan
    const taskBreakdown = this.extractSection(planContent, 'Task Breakdown');
    const implementationStrategy = this.extractSection(planContent, 'Implementation Strategy');
    const timeline = this.extractSection(planContent, 'Timeline');

    const section = `## Implementation Plan

${taskBreakdown || 'No detailed task breakdown available.'}

${implementationStrategy || 'No implementation strategy specified.'}

${timeline || 'No timeline specified.'}
`;

    prompt.content += section;
    prompt.metadata.sections.push('implementation-plan');
  }

  async addAcceptanceCriteriaSection(prompt, contract) {
    const section = `## Acceptance Criteria

${contract.acceptanceTests?.map(test =>
  `- **${test.description}**\n  - Type: ${test.type}\n  - Priority: ${test.priority}\n  - Criteria: ${test.criteria || test.verification || 'TBD'}`
).join('\n\n') || 'No acceptance tests defined.'}
`;

    prompt.content += section;
    prompt.metadata.sections.push('acceptance-criteria');
  }

  async addAssumptionsSection(prompt, contract) {
    const section = `## Assumptions & Risks

**Assumptions:**
${contract.assumptions?.map(a =>
  `- ${a.description} (Confidence: ${a.confidence}, Impact if wrong: ${a.impact?.level || 'unknown'})`
).join('\n') || 'No assumptions documented.'}

**Risks:**
${contract.risks?.map(r =>
  `- ${r.description} (Probability: ${r.probability}, Impact: ${r.impact})`
).join('\n') || 'No risks identified.'}

**Unknowns:**
${contract.unknowns?.map(u =>
  `- ${u.description} (Impact: ${u.impact})`
).join('\n') || 'No unknowns identified.'}
`;

    prompt.content += section;
    prompt.metadata.sections.push('assumptions-risks');
  }

  async addConstraintsSection(prompt, contract) {
    const section = `## Constraints & Dependencies

**Technical Constraints:**
${contract.constraints?.filter(c => c.type === 'technical').map(c => `- ${c.description}`).join('\n') || 'None specified.'}

**Business Constraints:**
${contract.constraints?.filter(c => c.type === 'business').map(c => `- ${c.description}`).join('\n') || 'None specified.'}

**External Dependencies:**
${contract.dependencies?.external?.map(d => `- ${d.description} (${d.status})`).join('\n') || 'None specified.'}

**Stakeholders:**
${contract.stakeholders?.map(s => `- ${s.name} (${s.role}) - ${s.interest}`).join('\n') || 'None specified.'}
`;

    prompt.content += section;
    prompt.metadata.sections.push('constraints-dependencies');
  }

  async addCuratedContextSection(prompt, contract) {
    // Try to load context pack if it exists
    let contextPackInfo = '';
    try {
      const contextPackDir = path.join(this.rootDir, '.contextpack');
      const metadataPath = path.join(contextPackDir, 'metadata.json');

      if (await this.fileExists(metadataPath)) {
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
        contextPackInfo = `
Context pack available: ${metadata.totalSizeKB}KB, ${metadata.fileCount} files
Key files included: ${await this.getKeyFilesFromPack(contextPackDir)}`;
      }
    } catch (error) {
      // Context pack not available
    }

    const section = `## Curated Context

${contextPackInfo || 'No context pack available. Include relevant files manually.'}

**Relevant Documentation:**
- Implementation Guide: IMPLEMENTATION_GUIDE.md
- Engineering Handbook: docs/engineering-handbook.md
- Project Schemas: schemas/*.json

**Code Context:**
Include the following files in your analysis:
- Core schema: schemas/project.manifest.schema.json
- Context contract schema: schemas/context-contract.schema.json
- Implementation target files (based on impact analysis)
`;

    prompt.content += section;
    prompt.metadata.sections.push('curated-context');
  }

  async addInstructionsSection(prompt, contract) {
    const section = `## Instructions

You are implementing this feature for DevEnvTemplate, a technology-agnostic development environment. Follow these guidelines:

### Development Standards
- **SOLID Principles**: Ensure single responsibility, open/closed, etc.
- **First Principles**: Question assumptions, build from fundamentals
- **Context-First**: Never touch code twice - understand completely before implementing
- **Quality Gates**: All changes must pass linting, type checking, and tests

### Implementation Approach
1. **Validate Understanding**: Confirm you understand the problem, goals, and constraints
2. **Plan Implementation**: Break down into specific, testable changes
3. **Code Changes**: Implement exactly as specified in the plan
4. **Testing**: Ensure all acceptance criteria are met
5. **Documentation**: Update docs if new functionality is added

### Code Quality Requirements
- TypeScript strict mode compliance
- ESLint/Prettier formatting
- Comprehensive error handling
- Accessibility compliance (WCAG guidelines)
- Performance considerations
- Security best practices

### Deliverables
- Working code that meets all acceptance criteria
- Unit/integration tests as appropriate
- Updated documentation if needed
- No breaking changes unless explicitly approved

### Communication
If anything is unclear or you need clarification on requirements, assumptions, or constraints, ask specific questions rather than making assumptions.

---

**Ready to implement?** Provide your implementation plan and ask any clarifying questions before proceeding with code changes.`;

    prompt.content += section;
    prompt.metadata.sections.push('instructions');
  }

  extractSection(content, sectionName) {
    const lines = content.split('\n');
    const sectionStart = lines.findIndex(line =>
      line.toLowerCase().includes(`## ${sectionName.toLowerCase()}`)
    );

    if (sectionStart === -1) return null;

    let sectionEnd = lines.length;
    for (let i = sectionStart + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        sectionEnd = i;
        break;
      }
    }

    return lines.slice(sectionStart, sectionEnd).join('\n');
  }

  estimateTokenCount(text) {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getKeyFilesFromPack(contextPackDir) {
    try {
      const filesPath = path.join(contextPackDir, 'files');
      const files = await fs.readdir(filesPath);
      return files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : '');
    } catch {
      return 'None specified';
    }
  }

  async outputPrompt(prompt, options) {
    let output = '';

    if (options.format === 'json') {
      output = JSON.stringify(prompt, null, 2);
    } else if (options.format === 'clipboard') {
      output = prompt.content;
      // In a real implementation, you'd use a clipboard library
      console.log('📋 Prompt copied to clipboard (simulated)');
    } else {
      output = prompt.content;
    }

    if (options.output) {
      await fs.writeFile(options.output, output);
      console.log(`💾 Prompt saved to: ${options.output}`);
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('GENERATED PROMPT');
      console.log('='.repeat(80));
      console.log(output);
      console.log('='.repeat(80));
    }
  }
}

// Run the prompt builder
if (require.main === module) {
  const builder = new PromptBuilder();
  builder.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = PromptBuilder;
