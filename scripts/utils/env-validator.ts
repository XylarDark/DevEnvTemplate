/**
 * Environment Variable Validation Utilities
 * 
 * Provides framework-agnostic utilities for:
 * - Environment variable presence checks
 * - Format validation (base64, hex, etc.)
 * - Validation with helpful error messages
 * - Multiple variable checks
 */

import { validateBase64Key, verifyKeyFormat } from './crypto-helpers';

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
export function requireEnvVar(
  name: string,
  options: EnvVarOptions = {}
): string {
  const value = process.env[name];
  
  if (!value) {
    const hint = options.hint || `Set ${name} in your environment or .env file`;
    const docs = options.docs ? `\nSee ${options.docs} for more information.` : '';
    
    throw new Error(
      `Environment variable ${name} is required but not set.\n` +
      `Hint: ${hint}${docs}`
    );
  }
  
  // Run validator if provided
  if (options.validator) {
    const isValid = options.validator(value);
    if (!isValid) {
      const errorMessage = options.errorMessage || 
        `Environment variable ${name} failed validation`;
      const hint = options.hint || `Check the format of ${name}`;
      const docs = options.docs ? `\nSee ${options.docs} for more information.` : '';
      
      throw new Error(
        `${errorMessage}.\n` +
        `Hint: ${hint}${docs}`
      );
    }
  }
  
  return value;
}

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
export function validateEnvVar(
  name: string,
  validator: (value: string) => boolean,
  errorMessage: string
): string {
  const value = process.env[name];
  
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  
  if (!validator(value)) {
    throw new Error(errorMessage);
  }
  
  return value;
}

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
export function requireEnvVars(
  vars: (string | { name: string; options?: EnvVarOptions })[]
): Record<string, string> {
  const result: Record<string, string> = {};
  const errors: string[] = [];
  
  for (const varDef of vars) {
    const name = typeof varDef === 'string' ? varDef : varDef.name;
    const options = typeof varDef === 'string' ? {} : (varDef.options || {});
    
    try {
      result[name] = requireEnvVar(name, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(
      `Missing or invalid environment variables:\n${errors.join('\n')}`
    );
  }
  
  return result;
}

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
export function hasEnvVar(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value !== '';
}

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
export function getEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

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
export function requireEncryptionKey(
  name: string,
  expectedBytes: number = 32
): string {
  return requireEnvVar(name, {
    validator: (value) => verifyKeyFormat(value, expectedBytes),
    errorMessage: `${name} must be a valid ${expectedBytes}-byte base64-encoded key`,
    hint: `Generate a key using: node dist/scripts/tools/generate-key.js --length ${expectedBytes}`,
    docs: 'docs/BEST-PRACTICES.md#encryption-key-generation'
  });
}

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
export function checkMissingEnvVars(vars: string[]): string[] {
  return vars.filter(name => !hasEnvVar(name));
}

