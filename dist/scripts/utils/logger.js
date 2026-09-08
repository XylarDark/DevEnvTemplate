"use strict";
/**
 * Structured Logging Utility
 *
 * Provides consistent logging across the application with:
 * - Log levels (DEBUG, INFO, WARN, ERROR, SILENT)
 * - Contextual logging with hierarchical context
 * - JSON output mode for CI/log aggregation
 * - Environment variable configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LOG_LEVELS = void 0;
exports.createLogger = createLogger;
exports.LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SILENT: 4,
};
class Logger {
    level;
    context;
    jsonOutput;
    constructor(options = {}) {
        // Get log level from options or environment variable
        const envLevel = process.env.LOG_LEVEL;
        const levelOption = options.level || envLevel || 'INFO';
        this.level = exports.LOG_LEVELS[levelOption.toUpperCase()] ?? exports.LOG_LEVELS.INFO;
        // Context for this logger instance
        this.context = options.context || 'app';
        // JSON output mode (useful for CI/log aggregation)
        const envJson = process.env.LOG_JSON;
        this.jsonOutput = options.json || (envJson && envJson.toLowerCase() === 'true') || false;
    }
    /**
     * Internal logging method
     * @private
     */
    _log(level, message, meta = {}) {
        // Filter by log level
        if (exports.LOG_LEVELS[level] < this.level) {
            return;
        }
        const timestamp = new Date().toISOString();
        if (this.jsonOutput) {
            // JSON format for machine parsing
            console.log(JSON.stringify({
                timestamp,
                level,
                context: this.context,
                message,
                ...meta,
            }));
        }
        else {
            // Human-readable format
            const prefix = `[${timestamp}] [${level}] [${this.context}]`;
            const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            console.log(`${prefix} ${message}${metaStr}`);
        }
    }
    /**
     * Log debug message (most verbose)
     */
    debug(message, meta = {}) {
        this._log('DEBUG', message, meta);
    }
    /**
     * Log info message (normal operations)
     */
    info(message, meta = {}) {
        this._log('INFO', message, meta);
    }
    /**
     * Log warning message (potential issues)
     */
    warn(message, meta = {}) {
        this._log('WARN', message, meta);
    }
    /**
     * Log error message (errors and failures)
     */
    error(message, meta = {}) {
        this._log('ERROR', message, meta);
    }
    /**
     * Create a child logger with additional context
     */
    child(childContext) {
        return new Logger({
            level: Object.keys(exports.LOG_LEVELS).find(k => exports.LOG_LEVELS[k] === this.level),
            context: `${this.context}:${childContext}`,
            json: this.jsonOutput,
        });
    }
}
exports.Logger = Logger;
/**
 * Create a new logger instance
 */
function createLogger(options = {}) {
    return new Logger(options);
}
//# sourceMappingURL=logger.js.map