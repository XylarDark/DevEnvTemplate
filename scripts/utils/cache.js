/**
 * JavaScript wrapper for TypeScript cache module
 * Maintains backward compatibility
 */

const { FileCache, ConfigCache } = require('../../dist/scripts/utils/cache');

module.exports = {
  FileCache,
  ConfigCache
};

