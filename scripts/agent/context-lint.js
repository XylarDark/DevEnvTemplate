#!/usr/bin/env node

/**
 * Context Contract Linter
 *
 * Validates Context Contracts against schema and completeness requirements
 * before allowing implementation to proceed.
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const { Command } = require('commander');

class ContextLinter {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.schemasDir = path.join(this.rootDir, 'schemas');
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: true
    });
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    const program = new Command()
      .name('context-lint')
      .description('Validate Context Contract completeness and schema compliance')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .option('--strict', 'Fail on warnings, not just errors')
      .parse();

    const options = program.opts();

    try {
      console.log('🔍 Context Contract Linter\n');

      const contextContract = await this.loadContextContract(options.ctx);
      await this.loadSchemas();

      await this.validateSchema(contextContract);
      await this.validateCompleteness(contextContract);
      await this.validateLogic(contextContract);

      this.reportResults(options.strict);

      if (this.errors.length > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Linting failed:', error.message);
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

  async loadSchemas() {
    const schemaFiles = [
      'context-contract.schema.json',
      'task-slice.schema.json',
      'assumption.schema.json'
    ];

    for (const schemaFile of schemaFiles) {
      const schemaPath = path.join(this.schemasDir, schemaFile);
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      this.ajv.addSchema(schema, schema.$id);
    }
  }

  async validateSchema(contextContract) {
    console.log('📋 Validating schema compliance...');

    const validate = this.ajv.getSchema('https://devenvtemplate.com/schemas/context-contract.schema.json');
    const valid = validate(contextContract);

    if (!valid) {
      for (const error of validate.errors) {
        this.errors.push({
          type: 'schema',
          message: `Schema validation failed: ${error.instancePath} ${error.message}`,
          details: error
        });
      }
    }

    console.log('✅ Schema validation complete\n');
  }

  async validateCompleteness(contextContract) {
    console.log('🎯 Validating completeness...');

    // Required fields check
    const requiredFields = [
      'problem.statement',
      'problem.impact',
      'goals',
      'acceptanceTests',
      'stakeholders'
    ];

    for (const field of requiredFields) {
      if (!this.hasField(contextContract, field)) {
        this.errors.push({
          type: 'completeness',
          message: `Missing required field: ${field}`
        });
      }
    }

    // Goals validation
    if (contextContract.goals && contextContract.goals.length === 0) {
      this.errors.push({
        type: 'completeness',
        message: 'At least one goal must be defined'
      });
    }

    // Acceptance tests validation
    if (contextContract.acceptanceTests && contextContract.acceptanceTests.length === 0) {
      this.errors.push({
        type: 'completeness',
        message: 'At least one acceptance test must be defined'
      });
    }

    // Unknowns validation - should have investigation plans
    if (contextContract.unknowns) {
      for (const unknown of contextContract.unknowns) {
        if (!unknown.investigationPlan) {
          this.warnings.push({
            type: 'completeness',
            message: `Unknown "${unknown.description}" missing investigation plan`
          });
        }
      }
    }

    console.log('✅ Completeness validation complete\n');
  }

  async validateLogic(contextContract) {
    console.log('🧠 Validating logic and consistency...');

    // Check for conflicting non-goals
    if (contextContract.goals && contextContract.nonGoals) {
      for (const goal of contextContract.goals) {
        for (const nonGoal of contextContract.nonGoals) {
          if (this.isSimilar(goal.description, nonGoal)) {
            this.warnings.push({
              type: 'logic',
              message: `Potential conflict: goal "${goal.description}" vs non-goal "${nonGoal}"`
            });
          }
        }
      }
    }

    // Validate assumption confidence vs impact
    if (contextContract.assumptions) {
      for (const assumption of contextContract.assumptions) {
        if (assumption.confidence === 'low' && assumption.impact.level === 'critical') {
          this.warnings.push({
            type: 'logic',
            message: `High-impact assumption "${assumption.description}" has low confidence`
          });
        }
      }
    }

    // Check acceptance tests have clear criteria
    if (contextContract.acceptanceTests) {
      for (const test of contextContract.acceptanceTests) {
        if (!test.criteria && !test.verification) {
          this.warnings.push({
            type: 'logic',
            message: `Acceptance test "${test.description}" lacks verification criteria`
          });
        }
      }
    }

    console.log('✅ Logic validation complete\n');
  }

  hasField(obj, fieldPath) {
    const parts = fieldPath.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return current !== undefined && current !== null && current !== '';
  }

  isSimilar(text1, text2) {
    // Simple similarity check - could be enhanced with NLP
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length > Math.min(words1.length, words2.length) * 0.5;
  }

  reportResults(strict = false) {
    console.log('📊 LINTING RESULTS\n');

    if (this.errors.length === 0 && (this.warnings.length === 0 || !strict)) {
      console.log('✅ Context contract is valid!\n');
    } else {
      if (this.errors.length > 0) {
        console.log('❌ ERRORS:');
        for (const error of this.errors) {
          console.log(`  • ${error.message}`);
        }
        console.log();
      }

      if (this.warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        for (const warning of this.warnings) {
          console.log(`  • ${warning.message}`);
        }
        console.log();
      }

      if (this.errors.length > 0) {
        console.log('❌ Context contract validation failed\n');
      } else if (strict && this.warnings.length > 0) {
        console.log('⚠️  Context contract has warnings (strict mode enabled)\n');
      }
    }

    console.log(`📈 Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }
}

// Run the linter
if (require.main === module) {
  const linter = new ContextLinter();
  linter.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = ContextLinter;
