/**
 * Environment Variable Validation Checks
 * 
 * Provides doctor checks for:
 * - Required environment variables
 * - Environment variable formats
 * - Encryption keys with proper format
 * - Actionable feedback
 */

import * as fs from 'fs';
import * as path from 'path';
import { hasEnvVar, checkMissingEnvVars, requireEncryptionKey } from '../../utils/env-validator';
import { verifyKeyFormat } from '../../utils/crypto-helpers';
import { createActionableError } from '../../utils/error-helpers';

export interface EnvValidationCheck {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: () => Promise<{ passed: boolean; message?: string; hint?: string }>;
}

/**
 * Check for required environment variables from .env.example
 */
export async function checkRequiredEnvVars(projectRoot: string): Promise<{
  passed: boolean;
  message?: string;
  missing?: string[];
  hint?: string;
}> {
  const envExamplePath = path.join(projectRoot, '.env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    return {
      passed: true,
      message: '.env.example not found - skipping environment variable checks'
    };
  }
  
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
  const requiredVars: string[] = [];
  
  // Extract variable names from .env.example
  const lines = envExampleContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const varName = trimmed.split('=')[0].trim();
      if (varName) {
        requiredVars.push(varName);
      }
    }
  }
  
  if (requiredVars.length === 0) {
    return {
      passed: true,
      message: 'No environment variables found in .env.example'
    };
  }
  
  const missing = checkMissingEnvVars(requiredVars);
  
  if (missing.length > 0) {
    return {
      passed: false,
      message: `Missing required environment variables: ${missing.join(', ')}`,
      missing,
      hint: `Set these variables in your .env file or export them in your shell. See .env.example for expected values.`
    };
  }
  
  return {
    passed: true,
    message: `All required environment variables are set (${requiredVars.length} variables)`
  };
}

/**
 * Check for encryption keys with proper format
 */
export async function checkEncryptionKeys(projectRoot: string): Promise<{
  passed: boolean;
  message?: string;
  invalidKeys?: string[];
  hint?: string;
}> {
  const envExamplePath = path.join(projectRoot, '.env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    return {
      passed: true,
      message: '.env.example not found - skipping encryption key checks'
    };
  }
  
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
  const encryptionKeyVars: string[] = [];
  
  // Find variables that look like encryption keys
  const lines = envExampleContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const varName = trimmed.split('=')[0].trim();
      const lowerName = varName.toLowerCase();
      if (
        lowerName.includes('key') ||
        lowerName.includes('secret') ||
        lowerName.includes('encryption') ||
        lowerName.includes('token')
      ) {
        encryptionKeyVars.push(varName);
      }
    }
  }
  
  if (encryptionKeyVars.length === 0) {
    return {
      passed: true,
      message: 'No encryption key variables found in .env.example'
    };
  }
  
  const invalidKeys: string[] = [];
  
  for (const varName of encryptionKeyVars) {
    if (!hasEnvVar(varName)) {
      continue; // Skip missing vars (handled by checkRequiredEnvVars)
    }
    
    const value = process.env[varName];
    if (!value) {
      continue;
    }
    
    // Check if it looks like a base64 key (length >= 40)
    if (value.length >= 40) {
      // Try to validate as 32-byte or 64-byte key
      const isValid32 = verifyKeyFormat(value, 32);
      const isValid64 = verifyKeyFormat(value, 64);
      
      if (!isValid32 && !isValid64) {
        invalidKeys.push(varName);
      }
    }
  }
  
  if (invalidKeys.length > 0) {
    return {
      passed: false,
      message: `Invalid encryption key format: ${invalidKeys.join(', ')}`,
      invalidKeys,
      hint: `Generate valid keys using: node dist/scripts/tools/generate-key.js --length 32`
    };
  }
  
  return {
    passed: true,
    message: `All encryption keys have valid format (${encryptionKeyVars.length} keys)`
  };
}

/**
 * Check for .env file existence
 */
export async function checkEnvFile(projectRoot: string): Promise<{
  passed: boolean;
  message?: string;
  hint?: string;
}> {
  const envPath = path.join(projectRoot, '.env');
  const envExamplePath = path.join(projectRoot, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      return {
        passed: false,
        message: '.env file not found',
        hint: 'Create .env file based on .env.example and set required variables'
      };
    }
    return {
      passed: true,
      message: '.env file not found, but no .env.example exists'
    };
  }
  
  return {
    passed: true,
    message: '.env file exists'
  };
}

/**
 * Run all environment validation checks
 */
export async function runEnvValidationChecks(projectRoot: string): Promise<{
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    message?: string;
    hint?: string;
  }>;
}> {
  const checks = [];
  
  // Check for .env file
  const envFileCheck = await checkEnvFile(projectRoot);
  checks.push({
    name: 'Environment File',
    passed: envFileCheck.passed,
    message: envFileCheck.message,
    hint: envFileCheck.hint
  });
  
  // Check for required environment variables
  const requiredVarsCheck = await checkRequiredEnvVars(projectRoot);
  checks.push({
    name: 'Required Environment Variables',
    passed: requiredVarsCheck.passed,
    message: requiredVarsCheck.message,
    hint: requiredVarsCheck.hint
  });
  
  // Check for encryption key formats
  const encryptionKeysCheck = await checkEncryptionKeys(projectRoot);
  checks.push({
    name: 'Encryption Key Formats',
    passed: encryptionKeysCheck.passed,
    message: encryptionKeysCheck.message,
    hint: encryptionKeysCheck.hint
  });
  
  const allPassed = checks.every(check => check.passed);
  
  return {
    passed: allPassed,
    checks
  };
}

