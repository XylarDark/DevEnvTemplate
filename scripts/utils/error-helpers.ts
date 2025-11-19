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
export function formatError(error: Error, context: ErrorContext = {}): string {
  let message = error.message;
  
  // Add file context
  if (context.file) {
    message = `Error in ${context.file}: ${message}`;
  }
  
  // Add hint
  if (context.hint) {
    message += `\n\nHint: ${context.hint}`;
  }
  
  // Add documentation link
  if (context.docs) {
    message += `\n\nSee ${context.docs} for more information.`;
  }
  
  // Add code snippet if provided
  if (context.code) {
    message += `\n\nCode:\n${context.code}`;
  }
  
  return message;
}

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
export function createActionableError(
  message: string,
  options: ActionableErrorOptions = {}
): Error {
  let fullMessage = message;
  
  // Add hints
  if (options.hints && options.hints.length > 0) {
    fullMessage += '\n\nPossible solutions:';
    options.hints.forEach((hint, index) => {
      fullMessage += `\n  ${index + 1}. ${hint}`;
    });
  }
  
  // Add documentation link
  if (options.docs) {
    fullMessage += `\n\nSee ${options.docs} for more information.`;
  }
  
  // Add code snippet if provided
  if (options.code) {
    fullMessage += `\n\nExample:\n${options.code}`;
  }
  
  const error = new Error(fullMessage);
  
  // Add category to error object for programmatic access
  if (options.category) {
    (error as any).category = options.category;
  }
  
  return error;
}

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
export function categorizeError(error: Error): ErrorCategory {
  // Check if category is already set
  if ((error as any).category) {
    return (error as any).category;
  }
  
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  
  // Validation errors
  if (
    name.includes('validation') ||
    name.includes('invalid') ||
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('format') ||
    message.includes('must be')
  ) {
    return 'validation';
  }
  
  // Configuration errors
  if (
    name.includes('config') ||
    message.includes('not set') ||
    message.includes('missing') ||
    message.includes('required') ||
    message.includes('environment variable')
  ) {
    return 'configuration';
  }
  
  // Runtime errors
  if (
    name.includes('runtime') ||
    name.includes('typeerror') ||
    name.includes('referenceerror') ||
    message.includes('cannot read') ||
    message.includes('undefined')
  ) {
    return 'runtime';
  }
  
  return 'unknown';
}

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
export function wrapError(error: Error, context: ErrorContext): Error {
  const formattedMessage = formatError(error, context);
  const wrappedError = new Error(formattedMessage);
  
  // Preserve original stack trace
  if (error.stack) {
    wrappedError.stack = `${formattedMessage}\n${error.stack}`;
  }
  
  // Preserve category if set
  if ((error as any).category) {
    (wrappedError as any).category = (error as any).category;
  }
  
  return wrappedError;
}

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
export function createJsonParseError(error: Error, filePath: string): Error {
  return createActionableError(
    `Failed to parse JSON in ${filePath}`,
    {
      hints: [
        `Check ${filePath} for syntax errors`,
        'Validate JSON using a JSON validator (e.g., jsonlint.com)',
        'Check for trailing commas, unclosed brackets, or invalid characters',
        'Ensure all strings are properly quoted'
      ],
      docs: 'docs/TROUBLESHOOTING.md#json-parsing-errors',
      category: 'validation'
    }
  );
}

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
export function createFileNotFoundError(
  filePath: string,
  hint?: string
): Error {
  return createActionableError(
    `File not found: ${filePath}`,
    {
      hints: hint ? [hint] : [
        `Check if ${filePath} exists in the project root`,
        'Verify the file path is correct',
        'Create the file if it is missing'
      ],
      category: 'configuration'
    }
  );
}

