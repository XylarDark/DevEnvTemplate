/**
 * Documentation Organizer Utility
 * 
 * Automatically detects and organizes markdown files into appropriate directories
 * based on configurable rules to prevent documentation clutter in project root.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import yaml from 'yaml';
import { resolveConfigPath, resolveProjectRoot } from './path-resolver';
import { execSync } from 'child_process';

/**
 * Configuration for documentation organization
 */
export interface DocsOrganizationConfig {
  rootExceptions: string[];
  directoryRules: {
    [key: string]: {
      patterns: string[];
      target: string;
    };
  };
  defaultTarget: string;
}

/**
 * Result of organizing documentation
 */
export interface OrganizeResult {
  success: boolean;
  filesToMove: FileMove[];
  conflicts: Conflict[];
  errors: string[];
  dryRun: boolean;
}

/**
 * Represents a file that should be moved
 */
export interface FileMove {
  source: string;
  target: string;
  targetDir: string;
  reason: string;
}

/**
 * Represents a conflict (target file already exists)
 */
export interface Conflict {
  source: string;
  target: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  needsOrganization: boolean;
  misplacedFiles: string[];
  totalFiles: number;
}

/**
 * Load documentation organization configuration
 */
export async function loadDocsConfig(projectRoot: string): Promise<DocsOrganizationConfig> {
  // Try project-specific config first (.devenv/config/ or project root)
  const projectConfigPath = resolveConfigPath('docs-organization.yaml', projectRoot);
  
  // Try .devenv default config
  const devenvRoot = path.resolve(__dirname, '../../');
  const defaultConfigPath = path.join(devenvRoot, 'config', 'docs-organization.yaml');
  
  let configPath: string;
  let configContent: string;
  
  // Try project config first
  try {
    await fs.access(projectConfigPath);
    configPath = projectConfigPath;
    configContent = await fs.readFile(configPath, 'utf8');
  } catch {
    // Fallback to default config
    try {
      configPath = defaultConfigPath;
      configContent = await fs.readFile(configPath, 'utf8');
    } catch (error: any) {
      throw new Error(`Failed to load docs-organization.yaml: ${error.message}`);
    }
  }
  
  const config = yaml.parse(configContent) as DocsOrganizationConfig;
  
  // Validate config structure
  if (!config.rootExceptions || !Array.isArray(config.rootExceptions)) {
    throw new Error('Invalid config: rootExceptions must be an array');
  }
  
  if (!config.directoryRules || typeof config.directoryRules !== 'object') {
    throw new Error('Invalid config: directoryRules must be an object');
  }
  
  if (!config.defaultTarget || typeof config.defaultTarget !== 'string') {
    throw new Error('Invalid config: defaultTarget must be a string');
  }
  
  return config;
}

/**
 * Check if a filename matches a pattern (supports wildcards)
 * @internal
 */
export function matchesPattern(filename: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(filename);
}

/**
 * Determine target directory for a markdown file
 */
export function determineTargetDirectory(
  filename: string,
  config: DocsOrganizationConfig,
  projectRoot: string
): { target: string; reason: string } {
  // Check if file is in root exceptions
  if (config.rootExceptions.includes(filename)) {
    return { target: projectRoot, reason: 'Root exception' };
  }
  
  // Check directory rules
  for (const [ruleName, rule] of Object.entries(config.directoryRules)) {
    for (const pattern of rule.patterns) {
      if (matchesPattern(filename, pattern)) {
        const targetDir = path.join(projectRoot, rule.target);
        return { target: targetDir, reason: `Matches ${ruleName} rule (${pattern})` };
      }
    }
  }
  
  // Default target
  const defaultDir = path.join(projectRoot, config.defaultTarget);
  return { target: defaultDir, reason: 'Default target' };
}

/**
 * Detect markdown files in project root that should be moved
 */
export async function detectMisplacedDocs(projectRoot: string): Promise<string[]> {
  const misplaced: string[] = [];
  
  try {
    const files = await fs.readdir(projectRoot);
    const config = await loadDocsConfig(projectRoot);
    
    for (const file of files) {
      // Only check .md files
      if (!file.endsWith('.md')) {
        continue;
      }
      
      const filePath = path.join(projectRoot, file);
      const stats = await fs.stat(filePath);
      
      // Only check files (not directories)
      if (!stats.isFile()) {
        continue;
      }
      
      // Check if file should be moved
      const { target } = determineTargetDirectory(file, config, projectRoot);
      
      // If target is not project root, file should be moved
      if (target !== projectRoot) {
        misplaced.push(file);
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to detect misplaced docs: ${error.message}`);
  }
  
  return misplaced;
}

/**
 * Check if a file is tracked by git
 */
function isGitTracked(filePath: string, projectRoot: string): boolean {
  try {
    const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
    execSync(`git ls-files --error-unmatch "${relativePath}"`, {
      cwd: projectRoot,
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Organize documentation files
 */
export async function organizeDocumentation(
  projectRoot: string,
  dryRun: boolean = true
): Promise<OrganizeResult> {
  const result: OrganizeResult = {
    success: true,
    filesToMove: [],
    conflicts: [],
    errors: [],
    dryRun
  };
  
  try {
    const config = await loadDocsConfig(projectRoot);
    const misplacedFiles = await detectMisplacedDocs(projectRoot);
    
    for (const filename of misplacedFiles) {
      const sourcePath = path.join(projectRoot, filename);
      const { target: targetDir, reason } = determineTargetDirectory(filename, config, projectRoot);
      const targetPath = path.join(targetDir, filename);
      
      // Check if target directory exists, create if needed
      if (!dryRun) {
        try {
          await fs.access(targetDir);
        } catch {
          await fs.mkdir(targetDir, { recursive: true });
        }
      }
      
      // Check for conflicts
      try {
        await fs.access(targetPath);
        result.conflicts.push({
          source: sourcePath,
          target: targetPath,
          message: `Target file already exists: ${targetPath}`
        });
        continue;
      } catch {
        // File doesn't exist, good to proceed
      }
      
      result.filesToMove.push({
        source: sourcePath,
        target: targetPath,
        targetDir,
        reason
      });
      
      // Perform move if not dry run
      if (!dryRun) {
        try {
          // Check if file is git-tracked
          const isTracked = isGitTracked(sourcePath, projectRoot);
          
          // Move file
          await fs.rename(sourcePath, targetPath);
          
          // Stage move in git if tracked
          if (isTracked) {
            try {
              execSync(`git add "${path.relative(projectRoot, targetPath).replace(/\\/g, '/')}"`, {
                cwd: projectRoot,
                stdio: 'ignore'
              });
              execSync(`git add "${path.relative(projectRoot, sourcePath).replace(/\\/g, '/')}"`, {
                cwd: projectRoot,
                stdio: 'ignore'
              });
            } catch (gitError) {
              // Git staging failed, but file was moved
              result.errors.push(`Failed to stage git move for ${filename}: ${gitError}`);
            }
          }
        } catch (moveError: any) {
          result.errors.push(`Failed to move ${filename}: ${moveError.message}`);
          result.success = false;
        }
      }
    }
  } catch (error: any) {
    result.errors.push(`Organization failed: ${error.message}`);
    result.success = false;
  }
  
  return result;
}

/**
 * Validate if organization is needed
 */
export async function validateOrganization(projectRoot: string): Promise<ValidationResult> {
  try {
    const misplacedFiles = await detectMisplacedDocs(projectRoot);
    const files = await fs.readdir(projectRoot);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    return {
      needsOrganization: misplacedFiles.length > 0,
      misplacedFiles,
      totalFiles: mdFiles.length
    };
  } catch (error: any) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}

