"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEncryptionKey = generateEncryptionKey;
exports.validateBase64Key = validateBase64Key;
exports.verifyKeyFormat = verifyKeyFormat;
exports.generateAndValidateKey = generateAndValidateKey;
exports.getExpectedBase64Length = getExpectedBase64Length;
const crypto = __importStar(require("crypto"));
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
function generateEncryptionKey(length = 32) {
    // Generate random bytes
    const keyBytes = crypto.randomBytes(length);
    // Encode to base64 URL-safe with proper padding
    const keyB64 = keyBytes
        .toString('base64')
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
function validateBase64Key(key, expectedBytes = 32) {
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
                error: `Key must be ${expectedBytes} bytes when base64-decoded, got ${decoded.length}`,
            };
        }
        // Check base64 string length (should be 44 chars for 32 bytes)
        const expectedBase64Length = Math.ceil((expectedBytes * 4) / 3);
        if (key.length !== expectedBase64Length) {
            return {
                valid: false,
                error: `Base64 key must be ${expectedBase64Length} characters, got ${key.length}`,
            };
        }
        // Test round-trip
        const reencoded = decoded.toString('base64');
        if (key !== reencoded && key.replace(/=+$/, '') !== reencoded.replace(/=+$/, '')) {
            return {
                valid: false,
                error: 'Key format invalid: round-trip encoding test failed',
            };
        }
        return { valid: true };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            valid: false,
            error: `Invalid base64 format: ${errorMessage}`,
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
function verifyKeyFormat(key, expectedBytes = 32) {
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
function generateAndValidateKey(length = 32) {
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
function getExpectedBase64Length(byteLength) {
    return Math.ceil((byteLength * 4) / 3);
}
//# sourceMappingURL=crypto-helpers.js.map