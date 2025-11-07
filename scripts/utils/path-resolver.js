/**
 * Backward compatibility wrapper for path-resolver
 * Re-exports from compiled TypeScript
 */

const {
  resolveConfigPath,
  resolvePackPath,
  getAvailablePacks,
  configExists
} = require('../../dist/utils/path-resolver');

module.exports = {
  resolveConfigPath,
  resolvePackPath,
  getAvailablePacks,
  configExists
};
