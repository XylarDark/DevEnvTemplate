/**
 * Cryptographic Helper Utilities
 *
 * Provides technology-agnostic utilities for:
 * - Base64 encoding/decoding with proper padding
 * - Encryption key generation
 * - Key format validation
 *
 * These utilities prevent common mistakes like base64 padding errors
 * and provide consistent patterns across all projects.
 */
/**
 * Generate an encryption key with proper base64 URL-safe encoding
 *
 * @param length - Number of bytes for the key (default: 32 for AES-256)
 * @returns Base64 URL-safe encoded key with proper padding
 *
 * @example
 * ```typescript
 * const key = generateEncryptionKey(32); // 44 characters, ends with '='
 * ```
 */
export declare function generateEncryptionKey(length?: number): string;
/**
 * Validate base64 key format
 *
 * @param key - Base64 encoded key to validate
 * @param expectedBytes - Expected number of bytes when decoded (default: 32)
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateBase64Key(key, 32);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export declare function validateBase64Key(key: string, expectedBytes?: number): {
    valid: boolean;
    error?: string;
};
/**
 * Verify key format (length, padding, decode test)
 *
 * @param key - Base64 encoded key to verify
 * @param expectedBytes - Expected number of bytes when decoded (default: 32)
 * @returns True if key format is valid
 *
 * @example
 * ```typescript
 * if (verifyKeyFormat(key, 32)) {
 *   console.log('Key format is valid');
 * }
 * ```
 */
export declare function verifyKeyFormat(key: string, expectedBytes?: number): boolean;
/**
 * Generate encryption key and validate it
 *
 * @param length - Number of bytes for the key (default: 32)
 * @returns Generated and validated key
 * @throws Error if key generation or validation fails
 *
 * @example
 * ```typescript
 * try {
 *   const key = generateAndValidateKey(32);
 *   console.log(`Generated key: ${key}`);
 * } catch (error) {
 *   console.error('Key generation failed:', error);
 * }
 * ```
 */
export declare function generateAndValidateKey(length?: number): string;
/**
 * Calculate expected base64 length for a given byte length
 *
 * @param byteLength - Number of bytes
 * @returns Expected base64 string length
 */
export declare function getExpectedBase64Length(byteLength: number): number;
//# sourceMappingURL=crypto-helpers.d.ts.map