/**
 * Verification Utilities
 * 
 * Provides framework-agnostic utilities for:
 * - Pre-commit verification checks
 * - Pre-deployment verification checks
 * - Environment setup verification
 * - Framework-agnostic verification patterns
 */

import * as fs from 'fs';
import * as path from 'path';
import { hasEnvVar, checkMissingEnvVars, requireEncryptionKey } from './env-validator';
import { verifyKeyFormat } from './crypto-helpers';
import { createActionableError } from './error-helpers';

export interface VerificationResult {
  passed: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Run pre-commit verification checks
 * 
 * @param projectRoot - Root directory of the project
 * @returns Verification result with errors if any
 * 
 * @example
 * ```typescript
 * const result = await verifyPreCommit('/path/to/project');
 * if (!result.passed) {
 *   console.error('Pre-commit checks failed:', result.errors);
 * }
 * ```
 */
export async function verifyPreCommit(projectRoot: string): Promise<VerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for .env.example
  const envExamplePath = path.join(projectRoot, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    warnings.push('.env.example not found - consider adding it for documentation');
  }
  
  // Check for .gitignore containing .env
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('.env')) {
      errors.push('.gitignore does not include .env - secrets may be committed');
    }
  } else {
    warnings.push('.gitignore not found');
  }
  
  // Check for syntax errors in common config files
  const configFiles = ['package.json', 'tsconfig.json', 'pyproject.toml'];
  for (const configFile of configFiles) {
    const configPath = path.join(projectRoot, configFile);
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        if (configFile.endsWith('.json')) {
          JSON.parse(content);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Invalid JSON in ${configFile}: ${errorMessage}`);
      }
    }
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Run pre-deployment verification checks
 * 
 * @param projectRoot - Root directory of the project
 * @returns Verification result with errors if any
 * 
 * @example
 * ```typescript
 * const result = await verifyPreDeployment('/path/to/project');
 * if (!result.passed) {
 *   console.error('Pre-deployment checks failed:', result.errors);
 *   process.exit(1);
 * }
 * ```
 */
export async function verifyPreDeployment(projectRoot: string): Promise<VerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required environment variables (if .env.example exists)
  const envExamplePath = path.join(projectRoot, '.env.example');
  if (fs.existsSync(envExamplePath)) {
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
    
    // Check for encryption keys specifically
    const encryptionKeyVars = requiredVars.filter(v => 
      v.toLowerCase().includes('key') || 
      v.toLowerCase().includes('secret') ||
      v.toLowerCase().includes('encryption')
    );
    
    for (const varName of encryptionKeyVars) {
      if (!hasEnvVar(varName)) {
        errors.push(`Required environment variable ${varName} is not set`);
      } else {
        // Validate encryption key format if it looks like one
        const value = process.env[varName];
        if (value && value.length >= 40) {
          // Likely a base64 key, validate it
          try {
            if (!verifyKeyFormat(value, 32) && !verifyKeyFormat(value, 64)) {
              warnings.push(`${varName} may have invalid format - verify it's a valid base64 key`);
            }
          } catch {
            // Ignore validation errors for warnings
          }
        }
      }
    }
  }
  
  // Check for common security issues
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check for hardcoded secrets in scripts (basic check)
      const scripts = packageJson.scripts || {};
      for (const [scriptName, scriptContent] of Object.entries(scripts)) {
        const content = String(scriptContent);
        if (content.includes('password') || content.includes('secret') || content.includes('key=')) {
          warnings.push(`Script ${scriptName} may contain hardcoded secrets`);
        }
      }
    } catch {
      // Ignore parse errors (handled in pre-commit)
    }
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Verify environment setup
 * 
 * @param projectRoot - Root directory of the project
 * @returns Verification result with errors if any
 * 
 * @example
 * ```typescript
 * const result = await verifyEnvironment('/path/to/project');
 * if (!result.passed) {
 *   console.error('Environment setup incomplete:', result.errors);
 * }
 * ```
 */
export async function verifyEnvironment(projectRoot: string): Promise<VerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for .env file
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    warnings.push('.env file not found - environment variables may not be loaded');
  }
  
  // Check for .env.example
  const envExamplePath = path.join(projectRoot, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    warnings.push('.env.example not found - no template for environment variables');
  }
  
  // Check for required files based on project type
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const pyprojectTomlPath = path.join(projectRoot, 'pyproject.toml');
  
  if (fs.existsSync(packageJsonPath)) {
    // Node.js project
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      warnings.push('node_modules not found - run npm install');
    }
  }
  
  if (fs.existsSync(pyprojectTomlPath)) {
    // Python project
    const venvPath = path.join(projectRoot, '.venv');
    const venvAltPath = path.join(projectRoot, 'venv');
    if (!fs.existsSync(venvPath) && !fs.existsSync(venvAltPath)) {
      warnings.push('Python virtual environment not found - consider creating one');
    }
  }
  
  // Check for git repository
  const gitPath = path.join(projectRoot, '.git');
  if (!fs.existsSync(gitPath)) {
    warnings.push('Git repository not found - version control not initialized');
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Run all verification checks
 * 
 * @param projectRoot - Root directory of the project
 * @param checks - Array of check types to run (default: all)
 * @returns Combined verification result
 * 
 * @example
 * ```typescript
 * const result = await verifyAll('/path/to/project', ['preCommit', 'environment']);
 * ```
 */
export async function verifyAll(
  projectRoot: string,
  checks: ('preCommit' | 'preDeployment' | 'environment')[] = ['preCommit', 'preDeployment', 'environment']
): Promise<VerificationResult> {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  for (const check of checks) {
    let result: VerificationResult;
    
    switch (check) {
      case 'preCommit':
        result = await verifyPreCommit(projectRoot);
        break;
      case 'preDeployment':
        result = await verifyPreDeployment(projectRoot);
        break;
      case 'environment':
        result = await verifyEnvironment(projectRoot);
        break;
    }
    
    allErrors.push(...result.errors);
    if (result.warnings) {
      allWarnings.push(...result.warnings);
    }
  }
  
  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  };
}

