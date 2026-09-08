/**
 * Structured Logging Utility
 *
 * Provides consistent logging across the application with:
 * - Log levels (DEBUG, INFO, WARN, ERROR, SILENT)
 * - Contextual logging with hierarchical context
 * - JSON output mode for CI/log aggregation
 * - Environment variable configuration
 */
export declare const LOG_LEVELS: {
    readonly DEBUG: 0;
    readonly INFO: 1;
    readonly WARN: 2;
    readonly ERROR: 3;
    readonly SILENT: 4;
};
export type LogLevel = keyof typeof LOG_LEVELS;
export interface LoggerOptions {
    level?: string;
    context?: string;
    json?: boolean;
}
export interface LogMeta {
    [key: string]: any;
}
export declare class Logger {
    private level;
    private context;
    private jsonOutput;
    constructor(options?: LoggerOptions);
    /**
     * Internal logging method
     * @private
     */
    private _log;
    /**
     * Log debug message (most verbose)
     */
    debug(message: string, meta?: LogMeta): void;
    /**
     * Log info message (normal operations)
     */
    info(message: string, meta?: LogMeta): void;
    /**
     * Log warning message (potential issues)
     */
    warn(message: string, meta?: LogMeta): void;
    /**
     * Log error message (errors and failures)
     */
    error(message: string, meta?: LogMeta): void;
    /**
     * Create a child logger with additional context
     */
    child(childContext: string): Logger;
}
/**
 * Create a new logger instance
 */
export declare function createLogger(options?: LoggerOptions): Logger;
//# sourceMappingURL=logger.d.ts.map