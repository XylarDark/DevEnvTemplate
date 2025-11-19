#!/usr/bin/env node

/**
 * Encryption Key Generation Tool
 * 
 * CLI tool for generating encryption keys with proper base64 encoding.
 * Supports different key lengths and formats.
 * 
 * Usage:
 *   node dist/scripts/tools/generate-key.js [--length 32] [--format base64|hex]
 */

import { Command } from 'commander';
import { generateEncryptionKey, validateBase64Key, getExpectedBase64Length } from '../utils/crypto-helpers';

const program = new Command();

program
  .name('generate-key')
  .description('Generate encryption keys with proper base64 encoding')
  .version('1.0.0')
  .option('-l, --length <bytes>', 'Key length in bytes (default: 32)', '32')
  .option('-f, --format <format>', 'Output format: base64 or hex (default: base64)', 'base64')
  .option('-v, --validate', 'Validate the generated key', false)
  .option('--quiet', 'Only output the key (no additional messages)', false)
  .parse(process.argv);

const options = program.opts();

async function main() {
  const length = parseInt(options.length, 10);
  
  if (isNaN(length) || length <= 0) {
    console.error('Error: Length must be a positive number');
    process.exit(1);
  }
  
  if (length < 16) {
    console.error('Error: Key length must be at least 16 bytes for security');
    process.exit(1);
  }
  
  let key: string;
  
  if (options.format === 'hex') {
    // Generate hex format
    const crypto = require('crypto');
    key = crypto.randomBytes(length).toString('hex');
  } else {
    // Generate base64 format (default)
    key = generateEncryptionKey(length);
  }
  
  // Validate if requested
  if (options.validate && options.format === 'base64') {
    const validation = validateBase64Key(key, length);
    if (!validation.valid) {
      console.error(`Error: Generated key failed validation: ${validation.error}`);
      process.exit(1);
    }
  }
  
  // Output
  if (options.quiet) {
    console.log(key);
  } else {
    console.log('Generated encryption key:');
    console.log('');
    console.log(key);
    console.log('');
    if (options.format === 'base64') {
      const expectedLength = getExpectedBase64Length(length);
      console.log(`Key details:`);
      console.log(`  Format: Base64 URL-safe`);
      console.log(`  Length: ${length} bytes (${expectedLength} base64 characters)`);
      console.log(`  Valid: ${validateBase64Key(key, length).valid ? 'Yes' : 'No'}`);
    } else {
      console.log(`Key details:`);
      console.log(`  Format: Hexadecimal`);
      console.log(`  Length: ${length} bytes (${length * 2} hex characters)`);
    }
    console.log('');
    console.log('Usage:');
    console.log(`  export ENCRYPTION_KEY="${key}"`);
    console.log(`  # Or add to .env file:`);
    console.log(`  ENCRYPTION_KEY="${key}"`);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

