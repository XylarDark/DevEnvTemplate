/**
 * Environment Variable Validation Utilities
 *
 * Provides framework-agnostic utilities for:
 * - Environment variable presence checks
 * - Format validation (base64, hex, etc.)
 * - Validation with helpful error messages
 * - Multiple variable checks
 */
export interface EnvVarOptions {
    hint?: string;
    validator?: (value: string) => boolean;
    errorMessage?: string;
    docs?: string;
}
/**
 * Require an environment variable to be set
 *
 * @param name - Environment variable name
 * @param options - Optional configuration (hint, validator, error message, docs)
 * @returns The environment variable value
 * @throws Error if variable is not set or validation fails
 *
 * @example
 * ```typescript
 * // Simple check
 * const apiKey = requireEnvVar('API_KEY');
 *
 * // With hint
 * const dbUrl = requireEnvVar('DATABASE_URL', {
 *   hint: 'Set DATABASE_URL in your .env file or export it in your shell'
 * });
 *
 * // With validation
 * const encryptionKey = requireEnvVar('ENCRYPTION_KEY', {
 *   validator: (val) => verifyKeyFormat(val, 32),
 *   errorMessage: 'ENCRYPTION_KEY must be a valid 32-byte base64-encoded key'
 * });
 * ```
 */
export declare function requireEnvVar(name: string, options?: EnvVarOptions): string;
/**
 * Validate environment variable format
 *
 * @param name - Environment variable name
 * @param validator - Validation function
 * @param errorMessage - Custom error message if validation fails
 * @returns The environment variable value
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * const key = validateEnvVar(
 *   'ENCRYPTION_KEY',
 *   (val) => verifyKeyFormat(val, 32),
 *   'ENCRYPTION_KEY must be a valid 32-byte base64-encoded key'
 * );
 * ```
 */
export declare function validateEnvVar(name: string, validator: (value: string) => boolean, errorMessage: string): string;
/**
 * Check multiple required environment variables
 *
 * @param vars - Array of variable names or objects with name and options
 * @returns Record of variable names to values
 * @throws Error if any variable is missing or validation fails
 *
 * @example
 * ```typescript
 * // Simple check
 * const env = requireEnvVars(['API_KEY', 'DATABASE_URL']);
 *
 * // With validation
 * const env = requireEnvVars([
 *   'API_KEY',
 *   { name: 'ENCRYPTION_KEY', options: { validator: (v) => verifyKeyFormat(v, 32) } }
 * ]);
 * ```
 */
export declare function requireEnvVars(vars: (string | {
    name: string;
    options?: EnvVarOptions;
})[]): Record<string, string>;
/**
 * Check if environment variable is set (non-throwing)
 *
 * @param name - Environment variable name
 * @returns True if variable is set and non-empty
 *
 * @example
 * ```typescript
 * if (hasEnvVar('DEBUG')) {
 *   console.log('Debug mode enabled');
 * }
 * ```
 */
export declare function hasEnvVar(name: string): boolean;
/**
 * Get environment variable with default value
 *
 * @param name - Environment variable name
 * @param defaultValue - Default value if variable is not set
 * @returns Environment variable value or default
 *
 * @example
 * ```typescript
 * const port = getEnvVar('PORT', '3000');
 * ```
 */
export declare function getEnvVar(name: string, defaultValue: string): string;
/**
 * Validate base64-encoded encryption key environment variable
 *
 * @param name - Environment variable name
 * @param expectedBytes - Expected number of bytes (default: 32)
 * @returns The validated key
 * @throws Error if key is missing or invalid
 *
 * @example
 * ```typescript
 * const key = requireEncryptionKey('ENCRYPTION_KEY', 32);
 * ```
 */
export declare function requireEncryptionKey(name: string, expectedBytes?: number): string;
/**
 * Check if all required environment variables are set
 *
 * @param vars - Array of variable names
 * @returns Array of missing variable names
 *
 * @example
 * ```typescript
 * const missing = checkMissingEnvVars(['API_KEY', 'DATABASE_URL']);
 * if (missing.length > 0) {
 *   console.error('Missing variables:', missing);
 * }
 * ```
 */
export declare function checkMissingEnvVars(vars: string[]): string[];
//# sourceMappingURL=env-validator.d.ts.map