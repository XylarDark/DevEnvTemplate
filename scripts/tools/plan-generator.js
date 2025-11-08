#!/usr/bin/env node

/**
 * JavaScript wrapper for TypeScript plan-generator
 * Maintains backward compatibility
 */

const { PlanGenerator } = require('../../dist/.github/tools/plan-generator');

// Re-export the compiled TypeScript class
module.exports = PlanGenerator;

// CLI execution
if (require.main === module) {
  const generator = new PlanGenerator();
  generator.generate()
    .then(async (plan) => {
      console.log(plan);
      await generator.saveReport(plan);
    })
    .catch((error) => {
      console.error('Plan generation failed:', error.message);
      process.exit(1);
    });
}
