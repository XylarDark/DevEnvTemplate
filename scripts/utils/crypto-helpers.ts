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

import * as crypto from 'crypto';

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
export function generateEncryptionKey(length: number = 32): string {
  // Generate random bytes
  const keyBytes = crypto.randomBytes(length);
  
  // Encode to base64 URL-safe with proper padding
  const keyB64 = keyBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding temporarily
  
  // Add padding back to ensure proper length
  // Base64 encoding: 3 bytes -> 4 characters, padding needed for remainder
  const paddingNeeded = (4 - (keyB64.length % 4)) % 4;
  const paddedKey = keyB64 + '='.repeat(paddingNeeded);
  
  return paddedKey;
}

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
export function validateBase64Key(
  key: string,
  expectedBytes: number = 32
): { valid: boolean; error?: string } {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'Key must be a non-empty string' };
  }
  
  try {
    // Decode to verify format
    const decoded = Buffer.from(key, 'base64');
    
    // Check length
    if (decoded.length !== expectedBytes) {
      return {
        valid: false,
        error: `Key must be ${expectedBytes} bytes when base64-decoded, got ${decoded.length}`
      };
    }
    
    // Check base64 string length (should be 44 chars for 32 bytes)
    const expectedBase64Length = Math.ceil((expectedBytes * 4) / 3);
    if (key.length !== expectedBase64Length) {
      return {
        valid: false,
        error: `Base64 key must be ${expectedBase64Length} characters, got ${key.length}`
      };
    }
    
    // Test round-trip
    const reencoded = decoded.toString('base64');
    if (key !== reencoded && key.replace(/=+$/, '') !== reencoded.replace(/=+$/, '')) {
      return {
        valid: false,
        error: 'Key format invalid: round-trip encoding test failed'
      };
    }
    
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      error: `Invalid base64 format: ${errorMessage}`
    };
  }
}

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
export function verifyKeyFormat(
  key: string,
  expectedBytes: number = 32
): boolean {
  const result = validateBase64Key(key, expectedBytes);
  return result.valid;
}

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
export function generateAndValidateKey(length: number = 32): string {
  const key = generateEncryptionKey(length);
  const validation = validateBase64Key(key, length);
  
  if (!validation.valid) {
    throw new Error(`Generated key failed validation: ${validation.error}`);
  }
  
  return key;
}

/**
 * Calculate expected base64 length for a given byte length
 * 
 * @param byteLength - Number of bytes
 * @returns Expected base64 string length
 */
export function getExpectedBase64Length(byteLength: number): number {
  return Math.ceil((byteLength * 4) / 3);
}

