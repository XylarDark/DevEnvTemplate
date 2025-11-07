/**
 * Structured Logging Utility
 * 
 * Provides consistent logging across the application with:
 * - Log levels (DEBUG, INFO, WARN, ERROR, SILENT)
 * - Contextual logging with hierarchical context
 * - JSON output mode for CI/log aggregation
 * - Environment variable configuration
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export interface LoggerOptions {
  level?: string;
  context?: string;
  json?: boolean;
}

export interface LogMeta {
  [key: string]: any;
}

export class Logger {
  private level: number;
  private context: string;
  private jsonOutput: boolean;

  constructor(options: LoggerOptions = {}) {
    // Get log level from options or environment variable
    const envLevel = process.env.LOG_LEVEL;
    const levelOption = options.level || envLevel || 'INFO';
    this.level = LOG_LEVELS[levelOption.toUpperCase() as LogLevel] ?? LOG_LEVELS.INFO;
    
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
  private _log(level: LogLevel, message: string, meta: LogMeta = {}): void {
    // Filter by log level
    if (LOG_LEVELS[level] < this.level) {
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
        ...meta
      }));
    } else {
      // Human-readable format
      const prefix = `[${timestamp}] [${level}] [${this.context}]`;
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      console.log(`${prefix} ${message}${metaStr}`);
    }
  }

  /**
   * Log debug message (most verbose)
   */
  debug(message: string, meta: LogMeta = {}): void {
    this._log('DEBUG', message, meta);
  }

  /**
   * Log info message (normal operations)
   */
  info(message: string, meta: LogMeta = {}): void {
    this._log('INFO', message, meta);
  }

  /**
   * Log warning message (potential issues)
   */
  warn(message: string, meta: LogMeta = {}): void {
    this._log('WARN', message, meta);
  }

  /**
   * Log error message (errors and failures)
   */
  error(message: string, meta: LogMeta = {}): void {
    this._log('ERROR', message, meta);
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: string): Logger {
    return new Logger({
      level: Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k as LogLevel] === this.level),
      context: `${this.context}:${childContext}`,
      json: this.jsonOutput
    });
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}

