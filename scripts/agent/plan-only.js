#!/usr/bin/env node

/**
 * Plan-Only Implementation Planner
 *
 * Generates detailed implementation plans and acceptance tests without
 * making any code changes. Produces human-readable plans for review.
 */

const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');

class PlanOnlyGenerator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.plansDir = path.join(this.rootDir, 'plans');
  }

  async run() {
    const program = new Command()
      .name('plan-only')
      .description('Generate implementation plan without code changes')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .option('-o, --output <file>', 'Output plan file (default: auto-generated)')
      .parse();

    const options = program.opts();

    try {
      console.log('📝 Plan-Only Implementation Planner\n');

      const contextContract = await this.loadContextContract(options.ctx);
      const planId = this.generatePlanId(contextContract);
      const planPath = options.output || path.join(this.plansDir, `${planId}.md`);

      // Ensure plans directory exists
      await fs.mkdir(path.dirname(planPath), { recursive: true });

      const plan = await this.generatePlan(contextContract, planId);
      await this.savePlan(plan, planPath);

      console.log(`✅ Implementation plan generated: ${planPath}`);
      console.log(`📋 Plan ID: ${planId}`);

    } catch (error) {
      console.error('❌ Plan generation failed:', error.message);
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

  generatePlanId(contract) {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
    const shortId = contract.id.split('-').pop() || 'unknown';
    return `${shortId}-${timestamp}`;
  }

  async generatePlan(contract, planId) {
    console.log('🧠 Generating implementation plan...\n');

    const plan = {
      id: planId,
      contextContractId: contract.id,
      title: this.extractTitle(contract),
      generatedAt: new Date().toISOString(),
      summary: this.generateSummary(contract),
      assumptions: this.extractAssumptions(contract),
      acceptanceTests: this.extractAcceptanceTests(contract),
      taskSlices: await this.generateTaskSlices(contract),
      implementationStrategy: this.generateImplementationStrategy(contract),
      successMetrics: this.extractMetrics(contract),
      rollbackPlan: this.generateRollbackPlan(contract),
      timeline: this.estimateTimeline(contract),
      reviewers: this.identifyReviewers(contract)
    };

    return plan;
  }

  extractTitle(contract) {
    // Generate a concise title from the contract
    if (contract.problem?.statement) {
      const statement = contract.problem.statement;
      return statement.length > 80 ? statement.substring(0, 77) + '...' : statement;
    }
    return 'Implementation Plan';
  }

  generateSummary(contract) {
    return {
      problem: contract.problem?.statement || 'Not specified',
      goals: contract.goals?.map(g => g.description) || [],
      scope: this.summarizeScope(contract),
      estimatedEffort: this.estimateTotalEffort(contract),
      riskLevel: this.assessRiskLevel(contract)
    };
  }

  summarizeScope(contract) {
    const inScope = contract.scope?.inScope || [];
    const outOfScope = contract.scope?.outOfScope || [];

    return {
      inScope: inScope.slice(0, 5), // Limit for readability
      outOfScope: outOfScope.slice(0, 3),
      boundaries: contract.scope?.boundaries || {}
    };
  }

  estimateTotalEffort(contract) {
    // Simple effort estimation based on contract complexity
    let baseEffort = 1; // days

    if (contract.goals?.length > 3) baseEffort += 2;
    if (contract.acceptanceTests?.length > 5) baseEffort += 1;
    if (contract.unknowns?.length > 0) baseEffort += contract.unknowns.length * 0.5;
    if (contract.dependencies?.external?.length > 0) baseEffort += 1;

    return {
      days: Math.ceil(baseEffort),
      confidence: baseEffort > 3 ? 'medium' : 'high',
      factors: this.identifyEffortFactors(contract)
    };
  }

  identifyEffortFactors(contract) {
    const factors = [];
    if (contract.unknowns?.length > 0) factors.push('unknowns to investigate');
    if (contract.dependencies?.external?.length > 0) factors.push('external dependencies');
    if (contract.assumptions?.length > 0) factors.push('assumptions to validate');
    return factors;
  }

  assessRiskLevel(contract) {
    let riskScore = 0;

    if (contract.unknowns?.length > 2) riskScore += 2;
    if (contract.assumptions?.some(a => a.confidence === 'low')) riskScore += 1;
    if (contract.risks?.some(r => r.probability === 'high')) riskScore += 2;
    if (contract.dependencies?.external?.some(d => d.status === 'blocked')) riskScore += 1;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  extractAssumptions(contract) {
    return contract.assumptions?.map(assumption => ({
      description: assumption.description,
      confidence: assumption.confidence,
      impact: assumption.impact?.level || 'unknown',
      validationPlan: assumption.validationPlan?.method || 'TBD',
      owner: assumption.owner?.name || 'Unassigned'
    })) || [];
  }

  extractAcceptanceTests(contract) {
    return contract.acceptanceTests?.map(test => ({
      description: test.description,
      type: test.type,
      priority: test.priority,
      criteria: test.criteria || test.verification || 'TBD',
      automated: this.canBeAutomated(test)
    })) || [];
  }

  canBeAutomated(test) {
    // Simple heuristic for automation potential
    const automatedTypes = ['unit', 'integration', 'e2e'];
    return automatedTypes.includes(test.type);
  }

  async generateTaskSlices(contract) {
    // Break down implementation into logical task slices
    const slices = [];

    // Analyze contract to determine task breakdown
    if (contract.goals) {
      for (let i = 0; i < contract.goals.length; i++) {
        const goal = contract.goals[i];
        slices.push({
          id: `task-${i + 1}`,
          title: goal.description,
          description: `Implement: ${goal.description}`,
          acceptanceCriteria: [
            goal.criteria || 'Goal-specific criteria to be defined'
          ],
          dependencies: i > 0 ? [`task-${i}`] : [],
          estimatedEffort: this.estimateTaskEffort(goal, contract),
          riskLevel: this.assessTaskRisk(goal, contract)
        });
      }
    }

    // Add validation tasks if unknowns exist
    if (contract.unknowns?.length > 0) {
      slices.unshift({
        id: 'task-validation',
        title: 'Validate Assumptions and Investigate Unknowns',
        description: 'Research and validate assumptions before implementation',
        acceptanceCriteria: contract.unknowns.map(u => `Resolved: ${u.description}`),
        dependencies: [],
        estimatedEffort: { hours: contract.unknowns.length * 4, confidence: 'high' },
        riskLevel: 'medium'
      });
    }

    return slices;
  }

  estimateTaskEffort(goal, contract) {
    // Rough effort estimation per task
    let hours = 8; // Default 1 day

    if (goal.description.toLowerCase().includes('api')) hours += 8;
    if (goal.description.toLowerCase().includes('ui') || goal.description.toLowerCase().includes('component')) hours += 4;
    if (goal.description.toLowerCase().includes('test')) hours += 4;

    return {
      hours,
      confidence: 'medium'
    };
  }

  assessTaskRisk(goal, contract) {
    if (goal.description.toLowerCase().includes('breaking') ||
        goal.description.toLowerCase().includes('migration')) {
      return 'high';
    }
    if (goal.description.toLowerCase().includes('new') ||
        goal.description.toLowerCase().includes('experimental')) {
      return 'medium';
    }
    return 'low';
  }

  generateImplementationStrategy(contract) {
    return {
      approach: this.determineApproach(contract),
      order: this.determineOrder(contract),
      testing: this.determineTestingStrategy(contract),
      deployment: this.determineDeploymentStrategy(contract)
    };
  }

  determineApproach(contract) {
    if (contract.problem?.statement?.toLowerCase().includes('new')) {
      return 'Build new functionality with comprehensive testing';
    }
    if (contract.problem?.statement?.toLowerCase().includes('fix') ||
        contract.problem?.statement?.toLowerCase().includes('bug')) {
      return 'Fix existing issue with regression testing';
    }
    return 'Incremental enhancement with feature flags';
  }

  determineOrder(contract) {
    if (contract.dependencies?.prerequisites?.length > 0) {
      return 'Sequential: respect dependency order';
    }
    return 'Parallel: tasks can be implemented independently';
  }

  determineTestingStrategy(contract) {
    const testTypes = new Set();

    if (contract.acceptanceTests) {
      for (const test of contract.acceptanceTests) {
        testTypes.add(test.type);
      }
    }

    if (testTypes.has('unit')) return 'Unit + Integration testing';
    if (testTypes.has('e2e')) return 'End-to-end testing';
    return 'Manual testing with defined criteria';
  }

  determineDeploymentStrategy(contract) {
    if (contract.risks?.some(r => r.impact === 'high')) {
      return 'Gradual rollout with feature flags and rollback plan';
    }
    return 'Standard deployment with monitoring';
  }

  extractMetrics(contract) {
    return contract.metrics?.map(metric => ({
      name: metric.name,
      description: metric.description,
      target: metric.target,
      baseline: metric.baseline,
      measurement: `Track ${metric.name} before and after implementation`
    })) || [];
  }

  generateRollbackPlan(contract) {
    if (contract.rollback) {
      return contract.rollback;
    }

    return {
      strategy: 'Database backup + code revert',
      automated: false,
      risks: ['Data loss if not properly backed up'],
      timeline: '4-8 hours depending on complexity'
    };
  }

  estimateTimeline(contract) {
    const totalDays = this.estimateTotalEffort(contract).days;
    const phases = Math.ceil(totalDays / 7); // Rough weekly phases

    return {
      totalDays,
      phases,
      milestones: this.generateMilestones(contract, phases)
    };
  }

  generateMilestones(contract, phases) {
    const milestones = [];

    if (phases >= 1) {
      milestones.push({
        name: 'Planning Complete',
        description: 'Context contract finalized, assumptions validated',
        duration: '1 day'
      });
    }

    if (phases >= 2) {
      milestones.push({
        name: 'Core Implementation',
        description: 'Main functionality implemented and tested',
        duration: `${phases - 1} days`
      });
    }

    if (phases >= 1) {
      milestones.push({
        name: 'Validation & Deployment',
        description: 'Acceptance tests pass, deployed to production',
        duration: '1-2 days'
      });
    }

    return milestones;
  }

  identifyReviewers(contract) {
    const reviewers = new Set();

    // Add stakeholders marked as reviewers
    if (contract.stakeholders) {
      for (const stakeholder of contract.stakeholders) {
        if (stakeholder.interest === 'reviewer' || stakeholder.interest === 'approver') {
          reviewers.add(stakeholder.name);
        }
      }
    }

    // Add assumption owners
    if (contract.assumptions) {
      for (const assumption of contract.assumptions) {
        if (assumption.owner?.name) {
          reviewers.add(assumption.owner.name);
        }
      }
    }

    return Array.from(reviewers);
  }

  async savePlan(plan, filePath) {
    const markdown = this.generateMarkdown(plan);
    await fs.writeFile(filePath, markdown);
  }

  generateMarkdown(plan) {
    let md = `# Implementation Plan: ${plan.title}\n\n`;
    md += `**Plan ID:** ${plan.id}\n`;
    md += `**Context Contract:** ${plan.contextContractId}\n`;
    md += `**Generated:** ${plan.generatedAt}\n\n`;

    // Summary
    md += '## Summary\n\n';
    md += `**Problem:** ${plan.summary.problem}\n\n`;
    md += `**Goals:**\n`;
    for (const goal of plan.summary.goals) {
      md += `- ${goal}\n`;
    }
    md += '\n';
    md += `**Estimated Effort:** ${plan.summary.estimatedEffort.days} days (${plan.summary.estimatedEffort.confidence} confidence)\n`;
    md += `**Risk Level:** ${plan.summary.riskLevel}\n\n`;

    // Assumptions
    if (plan.assumptions.length > 0) {
      md += '## Assumptions\n\n';
      for (const assumption of plan.assumptions) {
        md += `- **${assumption.description}**\n`;
        md += `  - Confidence: ${assumption.confidence}\n`;
        md += `  - Impact: ${assumption.impact}\n`;
        md += `  - Validation: ${assumption.validationPlan}\n`;
        md += `  - Owner: ${assumption.owner}\n\n`;
      }
    }

    // Acceptance Tests
    if (plan.acceptanceTests.length > 0) {
      md += '## Acceptance Tests\n\n';
      for (const test of plan.acceptanceTests) {
        md += `- **${test.description}**\n`;
        md += `  - Type: ${test.type}\n`;
        md += `  - Priority: ${test.priority}\n`;
        md += `  - Criteria: ${test.criteria}\n`;
        md += `  - Automated: ${test.automated ? 'Yes' : 'No'}\n\n`;
      }
    }

    // Task Slices
    if (plan.taskSlices.length > 0) {
      md += '## Task Breakdown\n\n';
      for (const task of plan.taskSlices) {
        md += `### ${task.title}\n\n`;
        md += `**Task ID:** ${task.id}\n`;
        md += `**Description:** ${task.description}\n`;
        md += `**Effort:** ${task.estimatedEffort.hours} hours\n`;
        md += `**Risk:** ${task.riskLevel}\n\n`;
        md += `**Acceptance Criteria:**\n`;
        for (const criteria of task.acceptanceCriteria) {
          md += `- ${criteria}\n`;
        }
        md += '\n';
        if (task.dependencies.length > 0) {
          md += `**Dependencies:** ${task.dependencies.join(', ')}\n\n`;
        }
      }
    }

    // Implementation Strategy
    md += '## Implementation Strategy\n\n';
    md += `**Approach:** ${plan.implementationStrategy.approach}\n`;
    md += `**Order:** ${plan.implementationStrategy.order}\n`;
    md += `**Testing:** ${plan.implementationStrategy.testing}\n`;
    md += `**Deployment:** ${plan.implementationStrategy.deployment}\n\n`;

    // Success Metrics
    if (plan.successMetrics.length > 0) {
      md += '## Success Metrics\n\n';
      for (const metric of plan.successMetrics) {
        md += `- **${metric.name}:** ${metric.description}\n`;
        md += `  - Target: ${metric.target}\n`;
        md += `  - Baseline: ${metric.baseline}\n`;
        md += `  - Measurement: ${metric.measurement}\n\n`;
      }
    }

    // Timeline
    md += '## Timeline\n\n';
    md += `**Total Estimate:** ${plan.timeline.totalDays} days\n\n`;
    md += '### Milestones\n\n';
    for (const milestone of plan.timeline.milestones) {
      md += `- **${milestone.name}** (${milestone.duration}): ${milestone.description}\n`;
    }
    md += '\n';

    // Reviewers
    if (plan.reviewers.length > 0) {
      md += '## Required Reviewers\n\n';
      for (const reviewer of plan.reviewers) {
        md += `- ${reviewer}\n`;
      }
      md += '\n';
    }

    // Rollback Plan
    md += '## Rollback Plan\n\n';
    md += `**Strategy:** ${plan.rollbackPlan.strategy}\n`;
    md += `**Automated:** ${plan.rollbackPlan.automated ? 'Yes' : 'No'}\n`;
    md += `**Timeline:** ${plan.rollbackPlan.timeline}\n\n`;
    if (plan.rollbackPlan.risks.length > 0) {
      md += '**Risks:**\n';
      for (const risk of plan.rollbackPlan.risks) {
        md += `- ${risk}\n`;
      }
      md += '\n';
    }

    md += '---\n\n';
    md += '*This plan was generated automatically. Review and approve before implementation begins.*\n';

    return md;
  }
}

// Run the plan generator
if (require.main === module) {
  const generator = new PlanOnlyGenerator();
  generator.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = PlanOnlyGenerator;
