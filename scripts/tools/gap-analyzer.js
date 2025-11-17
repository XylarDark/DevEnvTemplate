#!/usr/bin/env node

/**
 * Gap Analyzer - JavaScript wrapper for TypeScript implementation
 * 
 * This wrapper provides backward compatibility by importing the compiled TypeScript version.
 */

const gapAnalyzerModule = require('../../dist/scripts/tools/gap-analyzer');
const GapAnalyzerClass =
  gapAnalyzerModule.GapAnalyzer || gapAnalyzerModule.default || gapAnalyzerModule;

// Run the analyzer if called directly
if (require.main === module) {
  const analyzer = new GapAnalyzerClass();
  analyzer.analyze()
    .then(async report => {
      console.log(report);
      await analyzer.saveReport(report);
    })
    .catch(error => {
      console.error('Gap analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = GapAnalyzerClass;
module.exports.GapAnalyzer = GapAnalyzerClass;
module.exports.default = GapAnalyzerClass;
