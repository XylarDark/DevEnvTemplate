#!/usr/bin/env node

/**
 * JavaScript wrapper for TypeScript plan-generator
 * Maintains backward compatibility
 */

const planGeneratorModule = require('../../dist/scripts/tools/plan-generator');
const PlanGeneratorClass =
  planGeneratorModule.PlanGenerator || planGeneratorModule.default || planGeneratorModule;

// Re-export for both default and named imports
module.exports = PlanGeneratorClass;
module.exports.PlanGenerator = PlanGeneratorClass;
module.exports.default = PlanGeneratorClass;

// CLI execution
if (require.main === module) {
  const generator = new PlanGeneratorClass();
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
