/**
 * Path resolver utility for dual-path loading during migration.
 * Supports new paths (config/, packs/) with fallback to old paths (root, presets/).
 * Enhanced with project root detection for embedded usage.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolve config file path with dual-path support
 * @param configName - Config filename (e.g., 'cleanup.config.yaml')
 * @param workingDir - Working directory (defaults to cwd)
 * @returns Resolved config path
 */
export function resolveConfigPath(configName: string, workingDir: string = process.cwd()): string {
  const newPath = path.join(workingDir, 'config', configName);
  const oldPath = path.join(workingDir, configName);

  // Try new path first
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  // Fallback to old path
  if (fs.existsSync(oldPath)) {
    return oldPath;
  }

  // Default to new path for creation
  return newPath;
}

/**
 * Resolve pack/preset file path with dual-path support
 * @param packName - Pack filename (e.g., 'node-basic.yaml')
 * @param workingDir - Working directory (defaults to __dirname/../../)
 * @returns Resolved pack path or null if not found
 */
export function resolvePackPath(packName: string, workingDir: string = path.join(__dirname, '../..')): string | null {
  const newPath = path.join(workingDir, 'packs', packName);
  const oldPath = path.join(workingDir, 'presets', packName);

  // Try new path first
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  // Fallback to old path
  if (fs.existsSync(oldPath)) {
    return oldPath;
  }

  return null;
}

/**
 * Get all available pack names from both locations
 * @param workingDir - Working directory (defaults to __dirname/../../)
 * @returns Array of available pack names
 */
export function getAvailablePacks(workingDir: string = path.join(__dirname, '../..')): string[] {
  const packs = new Set<string>();

  // Check new packs directory
  const newPacksDir = path.join(workingDir, 'packs');
  if (fs.existsSync(newPacksDir)) {
    try {
      const files = fs.readdirSync(newPacksDir);
      files.filter(f => f.endsWith('.yaml')).forEach(f => packs.add(f));
    } catch (err) {
      // Ignore directory read errors
    }
  }

  // Check old presets directory
  const oldPresetsDir = path.join(workingDir, 'presets');
  if (fs.existsSync(oldPresetsDir)) {
    try {
      const files = fs.readdirSync(oldPresetsDir);
      files.filter(f => f.endsWith('.yaml')).forEach(f => packs.add(f));
    } catch (err) {
      // Ignore directory read errors
    }
  }

  return Array.from(packs).sort();
}

/**
 * Check if a config file exists in either location
 * @param configName - Config filename
 * @param workingDir - Working directory (defaults to cwd)
 * @returns True if config exists in either location
 */
export function configExists(configName: string, workingDir: string = process.cwd()): boolean {
  const newPath = path.join(workingDir, 'config', configName);
  const oldPath = path.join(workingDir, configName);

  return fs.existsSync(newPath) || fs.existsSync(oldPath);
}

/**
 * Resolve project root by walking up directory tree
 * Detects embedded .devenv usage and finds actual project root
 * @param startDir - Starting directory (defaults to cwd)
 * @returns Project root path or startDir if not found
 */
export function resolveProjectRoot(startDir: string = process.cwd()): string {
  let current = path.resolve(startDir);
  
  // Check if we're in .devenv subdirectory
  if (path.basename(current) === '.devenv') {
    const parent = path.dirname(current);
    if (parent && parent !== current) {
      current = parent;
    }
  }
  
  // Walk up to find project root (has package.json, pyproject.toml, or .git)
  const rootMarkers = ['package.json', 'pyproject.toml', '.git', 'Cargo.toml', 'go.mod'];
  const maxDepth = 10; // Prevent infinite loops
  let depth = 0;
  
  while (depth < maxDepth && current !== path.dirname(current)) {
    // Check for root markers
    for (const marker of rootMarkers) {
      if (fs.existsSync(path.join(current, marker))) {
        return current;
      }
    }
    
    // Check if this is DevEnvTemplate itself (package.json name is devenv-template)
    try {
      const packageJsonPath = path.join(current, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name === 'devenv-template') {
          // This is DevEnvTemplate, walk up one more level
          const parent = path.dirname(current);
          if (parent && parent !== current) {
            return parent;
          }
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
    
    current = path.dirname(current);
    depth++;
  }
  
  // Fallback to start directory
  return startDir;
}

/**
 * Normalize path for cross-platform compatibility
 * @param filePath - Path to normalize
 * @returns Normalized path
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

