/**
 * Git Hook Installer
 * 
 * Installs git hooks for DevEnvTemplate features.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface HookInstallOptions {
  rootDir: string;
  hookType: 'pre-commit-docs';
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Install pre-commit hook for documentation organization
 */
export async function installPreCommitDocsHook(options: HookInstallOptions): Promise<boolean> {
  const { rootDir, dryRun, verbose } = options;
  
  const gitDir = path.join(rootDir, '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  const preCommitHook = path.join(hooksDir, 'pre-commit');
  const templatePath = path.join(__dirname, 'templates', 'pre-commit-docs-check.sh');
  
  // Check if .git exists
  try {
    await fs.access(gitDir);
  } catch {
    if (verbose) {
      console.log('❌ Not a git repository');
    }
    return false;
  }
  
  // Check if template exists
  try {
    await fs.access(templatePath);
  } catch {
    if (verbose) {
      console.log(`❌ Template not found: ${templatePath}`);
    }
    return false;
  }
  
  // Ensure hooks directory exists
  if (!dryRun) {
    await fs.mkdir(hooksDir, { recursive: true });
  }
  
  // Read template
  const templateContent = await fs.readFile(templatePath, 'utf8');
  
  // Check if hook already exists
  let existingHook = '';
  try {
    existingHook = await fs.readFile(preCommitHook, 'utf8');
  } catch {
    // Hook doesn't exist, that's fine
  }
  
  if (existingHook) {
    // Check if our hook is already installed
    if (existingHook.includes('pre-commit-docs-check') || existingHook.includes('Documentation Organization Check')) {
      if (verbose) {
        console.log('✅ Pre-commit docs hook already installed');
      }
      return true;
    }
    
    // Append to existing hook
    if (dryRun) {
      if (verbose) {
        console.log(`[DRY RUN] Would append docs check to existing pre-commit hook`);
      }
      return true;
    }
    
    const combinedHook = existingHook + '\n\n# DevEnvTemplate: Documentation Organization Check\n' + templateContent;
    await fs.writeFile(preCommitHook, combinedHook, 'utf8');
    
    // Make executable
    execSync(`chmod +x "${preCommitHook}"`, { cwd: rootDir });
    
    if (verbose) {
      console.log('✅ Added docs check to existing pre-commit hook');
    }
    return true;
  } else {
    // Create new hook
    if (dryRun) {
      if (verbose) {
        console.log(`[DRY RUN] Would create pre-commit hook at ${preCommitHook}`);
      }
      return true;
    }
    
    await fs.writeFile(preCommitHook, templateContent, 'utf8');
    
    // Make executable
    execSync(`chmod +x "${preCommitHook}"`, { cwd: rootDir });
    
    if (verbose) {
      console.log('✅ Installed pre-commit docs hook');
    }
    return true;
  }
}

/**
 * Install hook based on type
 */
export async function installHook(options: HookInstallOptions): Promise<boolean> {
  switch (options.hookType) {
    case 'pre-commit-docs':
      return installPreCommitDocsHook(options);
    default:
      if (options.verbose) {
        console.log(`❌ Unknown hook type: ${options.hookType}`);
      }
      return false;
  }
}

