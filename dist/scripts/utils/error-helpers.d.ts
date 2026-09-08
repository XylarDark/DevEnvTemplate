/**
 * Error Helper Utilities
 *
 * Provides utilities for:
 * - Error message formatting with context
 * - Actionable error messages with hints
 * - Links to documentation
 * - Error categorization
 */
export type ErrorCategory = 'validation' | 'configuration' | 'runtime' | 'unknown';
export interface ErrorContext {
    file?: string;
    hint?: string;
    docs?: string;
    code?: string;
}
export interface ActionableErrorOptions {
    hints?: string[];
    docs?: string;
    code?: string;
    category?: ErrorCategory;
}
/**
 * Format error with context and hints
 *
 * @param error - Original error
 * @param context - Additional context (file, hint, docs, code)
 * @returns Formatted error message
 *
 * @example
 * ```typescript
 * try {
 *   JSON.parse(invalidJson);
 * } catch (error) {
 *   const message = formatError(error as Error, {
 *     file: 'package.json',
 *     hint: 'Check JSON syntax using a JSON validator',
 *     docs: 'docs/TROUBLESHOOTING.md#json-parsing-errors'
 *   });
 *   console.error(message);
 * }
 * ```
 */
export declare function formatError(error: Error, context?: ErrorContext): string;
/**
 * Create actionable error message
 *
 * @param message - Base error message
 * @param options - Options (hints, docs, code, category)
 * @returns Error object with formatted message
 *
 * @example
 * ```typescript
 * throw createActionableError(
 *   'Invalid encryption key format',
 *   {
 *     hints: [
 *       'Key must be 44 characters for a 32-byte key',
 *       'Key must be base64 URL-safe encoded',
 *       'Generate a new key using: node dist/scripts/tools/generate-key.js'
 *     ],
 *     docs: 'docs/BEST-PRACTICES.md#encryption-key-generation'
 *   }
 * );
 * ```
 */
export declare function createActionableError(message: string, options?: ActionableErrorOptions): Error;
/**
 * Categorize errors for better handling
 *
 * @param error - Error to categorize
 * @returns Error category
 *
 * @example
 * ```typescript
 * const category = categorizeError(error);
 * if (category === 'validation') {
 *   // Handle validation errors
 * }
 * ```
 */
export declare function categorizeError(error: Error): ErrorCategory;
/**
 * Wrap error with context
 *
 * @param error - Original error
 * @param context - Additional context
 * @returns New error with formatted message
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation
 * } catch (error) {
 *   throw wrapError(error as Error, {
 *     file: 'config.json',
 *     hint: 'Check file syntax',
 *     docs: 'docs/TROUBLESHOOTING.md'
 *   });
 * }
 * ```
 */
export declare function wrapError(error: Error, context: ErrorContext): Error;
/**
 * Create JSON parsing error with helpful context
 *
 * @param error - JSON parse error
 * @param filePath - Path to the file that failed to parse
 * @returns Formatted error
 *
 * @example
 * ```typescript
 * try {
 *   JSON.parse(content);
 * } catch (error) {
 *   throw createJsonParseError(error as Error, 'package.json');
 * }
 * ```
 */
export declare function createJsonParseError(error: Error, filePath: string): Error;
/**
 * Create file not found error with helpful context
 *
 * @param filePath - Path to the missing file
 * @param hint - Optional hint about what the file should contain
 * @returns Formatted error
 *
 * @example
 * ```typescript
 * if (!fs.existsSync('package.json')) {
 *   throw createFileNotFoundError('package.json', 'Create package.json using npm init');
 * }
 * ```
 */
export declare function createFileNotFoundError(filePath: string, hint?: string): Error;
//# sourceMappingURL=error-helpers.d.ts.map