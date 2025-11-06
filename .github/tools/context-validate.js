#!/usr/bin/env node

/**
 * Context Validation Tool - CI-only utility
 *
 * Validates Context Contract JSON files against schema and checks assumptions.
 * Used by DevEnvTemplate CI to enforce Plan/Agent standards.
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');

class ContextValidator {
  constructor() {
    this.rootDir = process.cwd();
    this.schemaPath = path.join(this.rootDir, 'schemas', 'context-contract.schema.json');
    this.schema = null;
    this.validate = null;
  }

  async initialize() {
    try {
      const schemaContent = await fs.readFile(this.schemaPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
      const ajv = new Ajv({ allErrors: true, verbose: true });
      this.validate = ajv.compile(this.schema);
      console.log('✅ Context validator initialized');
    } catch (error) {
      console.error(`❌ Failed to initialize context validator: ${error.message}`);
      process.exit(1);
    }
  }

  async validateContracts(contractFiles) {
    console.log('🔍 Validating context contracts...\n');

    const results = {
      total: contractFiles.length,
      valid: 0,
      invalid: 0,
      highRiskAssumptions: [],
      errors: []
    };

    for (const filePath of contractFiles) {
      try {
        const result = await this.validateSingleContract(filePath);
        if (result.valid) {
          results.valid++;
          console.log(`✅ ${filePath} - Valid`);

          // Check for high-risk assumptions
          const highRisk = this.checkHighRiskAssumptions(result.contract);
          if (highRisk.length > 0) {
            results.highRiskAssumptions.push(...highRisk);
            console.log(`⚠️  ${filePath} - ${highRisk.length} high-risk assumptions need attention`);
          }
        } else {
          results.invalid++;
          results.errors.push({ file: filePath, errors: result.errors });
          console.log(`❌ ${filePath} - Invalid`);
          result.errors.forEach(error => {
            console.log(`   ${error.instancePath || 'root'}: ${error.message}`);
          });
        }
      } catch (error) {
        results.invalid++;
        results.errors.push({ file: filePath, error: error.message });
        console.log(`❌ ${filePath} - Error: ${error.message}`);
      }
    }

    console.log(`\n📊 Validation Summary:`);
    console.log(`   Total contracts: ${results.total}`);
    console.log(`   Valid: ${results.valid}`);
    console.log(`   Invalid: ${results.invalid}`);
    console.log(`   High-risk assumptions: ${results.highRiskAssumptions.length}`);

    if (results.invalid > 0) {
      console.log('\n❌ Validation failed - see errors above');
      process.exit(1);
    }

    if (results.highRiskAssumptions.length > 0) {
      console.log('\n⚠️  High-risk assumptions detected:');
      results.highRiskAssumptions.forEach(assumption => {
        console.log(`   ${assumption.file}: ${assumption.description} (impact: ${assumption.impact})`);
      });
      console.log('\n💡 High-risk assumptions must be resolved before implementation');
      process.exit(1);
    }

    console.log('\n✅ All context contracts valid and assumptions resolved');
    return results;
  }

  async validateSingleContract(filePath) {
    const fullPath = path.resolve(filePath);

    try {
      const content = await fs.readFile(fullPath, 'utf8');
      const contract = JSON.parse(content);

      const valid = this.validate(contract);

      return {
        valid,
        contract,
        errors: this.validate.errors || []
      };
    } catch (error) {
      return {
        valid: false,
        contract: null,
        errors: [{ message: error.message }]
      };
    }
  }

  checkHighRiskAssumptions(contract) {
    const highRisk = [];

    if (contract.assumptions) {
      contract.assumptions.forEach(assumption => {
        if (assumption.impact === 'high') {
          highRisk.push({
            file: contract.id || 'unknown',
            description: assumption.description,
            impact: assumption.impact,
            owner: assumption.owner,
            validationPlan: assumption.validationPlan
          });
        }
      });
    }

    return highRisk;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node context-validate.js <contract-file1> [<contract-file2> ...]');
    process.exit(1);
  }

  const validator = new ContextValidator();
  await validator.initialize();
  await validator.validateContracts(args);
}

// Export for testing
if (require.main === module) {
  main().catch(error => {
    console.error('Context validation failed:', error);
    process.exit(1);
  });
}

module.exports = ContextValidator;
