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
  analyzer
    .analyze()
    .then(async report => {
      console.log(report);
      await analyzer.saveReport(report);
      // The JSON is what the doctor and plan generator consume; the markdown is for humans.
      // Omitting it left this entry point producing a report nothing downstream could read.
      await analyzer.saveJsonReport();
    })
    .catch(error => {
      console.error('Gap analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = GapAnalyzerClass;
module.exports.GapAnalyzer = GapAnalyzerClass;
module.exports.default = GapAnalyzerClass;
