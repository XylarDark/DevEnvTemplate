/**
 * Backward compatibility wrapper for logger
 * Re-exports from compiled TypeScript
 */

const { createLogger, Logger, LOG_LEVELS } = require('../../dist/utils/logger');

module.exports = {
  createLogger,
  Logger,
  LOG_LEVELS
};

