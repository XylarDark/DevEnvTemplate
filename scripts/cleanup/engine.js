/**
 * JavaScript wrapper for TypeScript cleanup engine
 * Provides backward compatibility by re-exporting compiled TypeScript code
 */

const { CleanupEngine, executeCleanup } = require('../../dist/cleanup/engine');

module.exports = {
  CleanupEngine,
  executeCleanup,
};
