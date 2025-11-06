#!/usr/bin/env node

/**
 * Context Contract Questionnaire Generator
 *
 * Analyzes Context Contracts and generates targeted questions to fill gaps
 * before implementation begins.
 */

const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');

class QuestionnaireGenerator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.questions = [];
    this.priorities = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
  }

  async run() {
    const program = new Command()
      .name('questionnaire')
      .description('Generate targeted questions for Context Contract completion')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .option('-o, --output <file>', 'Output file for updated context contract')
      .option('--interactive', 'Run in interactive mode to answer questions')
      .parse();

    const options = program.opts();

    try {
      console.log('❓ Context Contract Questionnaire\n');

      const contextContract = await this.loadContextContract(options.ctx);

      this.analyzeContract(contextContract);
      this.rankQuestions();
      this.displayQuestions();

      if (options.interactive) {
        await this.runInteractiveMode(contextContract, options.output || options.ctx);
      }

    } catch (error) {
      console.error('❌ Questionnaire generation failed:', error.message);
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

  analyzeContract(contract) {
    this.checkProblemDefinition(contract);
    this.checkGoalsAndScope(contract);
    this.checkConstraintsAndDependencies(contract);
    this.checkAssumptionsAndRisks(contract);
    this.checkAcceptanceCriteria(contract);
    this.checkImplementationReadiness(contract);
  }

  checkProblemDefinition(contract) {
    if (!contract.problem) {
      this.addQuestion({
        priority: 'critical',
        category: 'problem',
        question: 'What specific problem are you trying to solve?',
        field: 'problem.statement',
        help: 'Describe the current situation and why it needs to change'
      });
    } else {
      if (!contract.problem.context) {
        this.addQuestion({
          priority: 'high',
          category: 'problem',
          question: 'What is the broader context or background for this problem?',
          field: 'problem.context',
          help: 'Explain the history or circumstances that led to this problem'
        });
      }

      if (!contract.problem.impact) {
        this.addQuestion({
          priority: 'high',
          category: 'problem',
          question: 'What is the impact of not solving this problem?',
          field: 'problem.impact',
          help: 'Describe the business/user impact and consequences of inaction'
        });
      }

      if (!contract.problem.currentState) {
        this.addQuestion({
          priority: 'medium',
          category: 'problem',
          question: 'How does the current system/process work?',
          field: 'problem.currentState',
          help: 'Document the existing workflow or implementation'
        });
      }

      if (!contract.problem.desiredState) {
        this.addQuestion({
          priority: 'medium',
          category: 'problem',
          question: 'How should the system/process work after implementation?',
          field: 'problem.desiredState',
          help: 'Describe the target state and desired behavior'
        });
      }
    }
  }

  checkGoalsAndScope(contract) {
    if (!contract.goals || contract.goals.length === 0) {
      this.addQuestion({
        priority: 'critical',
        category: 'goals',
        question: 'What are the specific goals or outcomes you want to achieve?',
        field: 'goals',
        help: 'List measurable objectives and success criteria'
      });
    } else {
      for (const goal of contract.goals) {
        if (!goal.criteria) {
          this.addQuestion({
            priority: 'high',
            category: 'goals',
            question: `How will you measure success for: "${goal.description}"?`,
            field: `goals.${contract.goals.indexOf(goal)}.criteria`,
            help: 'Define specific, measurable success criteria'
          });
        }
      }
    }

    if (!contract.nonGoals || contract.nonGoals.length === 0) {
      this.addQuestion({
        priority: 'medium',
        category: 'scope',
        question: 'What is explicitly OUT OF SCOPE for this work?',
        field: 'nonGoals',
        help: 'Clearly define boundaries to prevent scope creep'
      });
    }
  }

  checkConstraintsAndDependencies(contract) {
    if (!contract.constraints || contract.constraints.length === 0) {
      this.addQuestion({
        priority: 'high',
        category: 'constraints',
        question: 'What technical, business, or operational constraints apply?',
        field: 'constraints',
        help: 'List limitations, requirements, or restrictions'
      });
    }

    if (!contract.dependencies || !contract.dependencies.external ||
        contract.dependencies.external.length === 0) {
      this.addQuestion({
        priority: 'medium',
        category: 'dependencies',
        question: 'What external systems, APIs, or services does this depend on?',
        field: 'dependencies.external',
        help: 'Identify dependencies that could affect implementation timeline'
      });
    }
  }

  checkAssumptionsAndRisks(contract) {
    if (!contract.assumptions || contract.assumptions.length === 0) {
      this.addQuestion({
        priority: 'high',
        category: 'assumptions',
        question: 'What assumptions are you making that could affect implementation?',
        field: 'assumptions',
        help: 'Document uncertainties that should be validated before starting'
      });
    }

    if (!contract.risks || contract.risks.length === 0) {
      this.addQuestion({
        priority: 'medium',
        category: 'risks',
        question: 'What are the potential risks or failure modes?',
        field: 'risks',
        help: 'Identify what could go wrong and mitigation strategies'
      });
    }

    if (!contract.unknowns || contract.unknowns.length === 0) {
      this.addQuestion({
        priority: 'low',
        category: 'unknowns',
        question: 'What questions or unknowns need to be investigated?',
        field: 'unknowns',
        help: 'List things you need to learn or validate before finalizing plans'
      });
    }
  }

  checkAcceptanceCriteria(contract) {
    if (!contract.acceptanceTests || contract.acceptanceTests.length === 0) {
      this.addQuestion({
        priority: 'critical',
        category: 'acceptance',
        question: 'How will you verify that the implementation meets requirements?',
        field: 'acceptanceTests',
        help: 'Define specific tests or criteria that must pass'
      });
    } else {
      for (const test of contract.acceptanceTests) {
        if (!test.criteria && !test.verification) {
          this.addQuestion({
            priority: 'high',
            category: 'acceptance',
            question: `How will you verify: "${test.description}"?`,
            field: `acceptanceTests.${contract.acceptanceTests.indexOf(test)}.verification`,
            help: 'Specify concrete verification methods or criteria'
          });
        }
      }
    }
  }

  checkImplementationReadiness(contract) {
    if (!contract.stakeholders || contract.stakeholders.length === 0) {
      this.addQuestion({
        priority: 'medium',
        category: 'stakeholders',
        question: 'Who are the stakeholders and what is their level of involvement?',
        field: 'stakeholders',
        help: 'Identify people who need to be informed or approve this work'
      });
    }

    if (!contract.metrics || contract.metrics.length === 0) {
      this.addQuestion({
        priority: 'low',
        category: 'metrics',
        question: 'How will you measure the success or impact of this change?',
        field: 'metrics',
        help: 'Define success metrics and baseline measurements'
      });
    }
  }

  addQuestion(question) {
    this.questions.push({
      id: `q${this.questions.length + 1}`,
      ...question
    });
  }

  rankQuestions() {
    for (const question of this.questions) {
      this.priorities[question.priority].push(question);
    }
  }

  displayQuestions() {
    console.log('📋 GENERATED QUESTIONS\n');

    const priorities = ['critical', 'high', 'medium', 'low'];

    for (const priority of priorities) {
      const questions = this.priorities[priority];
      if (questions.length > 0) {
        console.log(`${priority.toUpperCase()} PRIORITY:`);
        for (const question of questions) {
          console.log(`  ${question.id}. ${question.question}`);
          console.log(`     💡 ${question.help}`);
          console.log(`     📍 Field: ${question.field}`);
          console.log();
        }
      }
    }

    console.log(`📊 Total: ${this.questions.length} questions generated`);
    console.log(`   Critical: ${this.priorities.critical.length}`);
    console.log(`   High: ${this.priorities.high.length}`);
    console.log(`   Medium: ${this.priorities.medium.length}`);
    console.log(`   Low: ${this.priorities.low.length}`);
    console.log();
  }

  async runInteractiveMode(contract, outputPath) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🤖 INTERACTIVE MODE\n');
    console.log('Answer the questions below to complete your context contract.');
    console.log('Press Enter to skip a question, or type your answer.\n');

    for (const priority of ['critical', 'high', 'medium', 'low']) {
      for (const question of this.priorities[priority]) {
        const answer = await this.askQuestion(rl, question);
        if (answer) {
          this.updateContract(contract, question.field, answer);
        }
      }
    }

    rl.close();

    // Save updated contract
    await fs.writeFile(outputPath, JSON.stringify(contract, null, 2));
    console.log(`\n💾 Updated context contract saved to: ${outputPath}`);
  }

  askQuestion(rl, question) {
    return new Promise((resolve) => {
      rl.question(`${question.question}\n> `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  updateContract(contract, fieldPath, value) {
    const parts = fieldPath.split('.');
    let current = contract;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (Array.isArray(current[lastPart])) {
      current[lastPart].push(value);
    } else {
      current[lastPart] = value;
    }
  }
}

// Run the questionnaire generator
if (require.main === module) {
  const generator = new QuestionnaireGenerator();
  generator.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = QuestionnaireGenerator;
