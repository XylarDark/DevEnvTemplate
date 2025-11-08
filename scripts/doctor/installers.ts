/**
 * Dependency Installer
 * 
 * Handles installing missing dev dependencies with --no-install guard.
 * Supports npm, pnpm, and yarn package managers.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface InstallerOptions {
  rootDir: string;
  noInstall?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface PackageManagerInfo {
  name: 'npm' | 'pnpm' | 'yarn';
  lockFile: string;
  installCommand: string;
  addDevCommand: (packages: string[]) => string;
}

export interface InstallResult {
  installed: string[];
  skipped: string[];
  errors: string[];
  packageManager: string;
}

/**
 * Detect which package manager is being used
 */
export async function detectPackageManager(rootDir: string): Promise<PackageManagerInfo> {
  const lockFiles: Record<string, PackageManagerInfo> = {
    'pnpm-lock.yaml': {
      name: 'pnpm',
      lockFile: 'pnpm-lock.yaml',
      installCommand: 'pnpm install',
      addDevCommand: (pkgs) => `pnpm add -D ${pkgs.join(' ')}`
    },
    'yarn.lock': {
      name: 'yarn',
      lockFile: 'yarn.lock',
      installCommand: 'yarn install',
      addDevCommand: (pkgs) => `yarn add -D ${pkgs.join(' ')}`
    },
    'package-lock.json': {
      name: 'npm',
      lockFile: 'package-lock.json',
      installCommand: 'npm install',
      addDevCommand: (pkgs) => `npm install --save-dev ${pkgs.join(' ')}`
    }
  };

  // Check for lock files in order of preference
  for (const [lockFile, info] of Object.entries(lockFiles)) {
    try {
      await fs.access(path.join(rootDir, lockFile));
      return info;
    } catch {
      continue;
    }
  }

  // Default to npm
  return lockFiles['package-lock.json'];
}

/**
 * Get required dev dependencies for a framework
 */
export function getRequiredDevDependencies(framework: string, hasTypeScript: boolean): string[] {
  const base: string[] = [];

  if (hasTypeScript) {
    base.push('typescript', '@types/node');
  }

  // Always recommend basic tooling
  base.push('eslint', 'prettier');

  // Framework-specific
  const frameworkDeps: Record<string, string[]> = {
    nextjs: hasTypeScript ? ['eslint-config-next'] : ['eslint-config-next'],
    vite: [
      '@vitejs/plugin-react',
      hasTypeScript ? '@typescript-eslint/eslint-plugin' : '',
      hasTypeScript ? '@typescript-eslint/parser' : '',
      'eslint-plugin-react-hooks',
      'eslint-plugin-react'
    ].filter(Boolean),
    express: hasTypeScript ? ['@types/express', 'tsx'] : ['tsx']
  };

  if (frameworkDeps[framework]) {
    base.push(...frameworkDeps[framework]);
  }

  return [...new Set(base)]; // Remove duplicates
}

/**
 * Check which packages are already installed
 */
export async function getInstalledPackages(rootDir: string): Promise<Set<string>> {
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    const deps = new Set<string>();
    
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(pkg => deps.add(pkg));
    }
    
    if (packageJson.devDependencies) {
      Object.keys(packageJson.devDependencies).forEach(pkg => deps.add(pkg));
    }
    
    return deps;
  } catch (error) {
    return new Set();
  }
}

/**
 * Install missing dev dependencies
 */
export async function installDevDependencies(
  packages: string[],
  options: InstallerOptions
): Promise<InstallResult> {
  const result: InstallResult = {
    installed: [],
    skipped: [],
    errors: [],
    packageManager: 'npm'
  };

  if (packages.length === 0) {
    return result;
  }

  // Check if --no-install flag is set
  if (options.noInstall) {
    result.skipped = packages;
    if (options.verbose) {
      console.log('⏭️  Skipping installation (--no-install flag set)');
      console.log('   To install manually, run:');
      const pm = await detectPackageManager(options.rootDir);
      console.log(`   ${pm.addDevCommand(packages)}`);
    }
    return result;
  }

  // Detect package manager
  const pm = await detectPackageManager(options.rootDir);
  result.packageManager = pm.name;

  // Get already installed packages
  const installed = await getInstalledPackages(options.rootDir);
  const toInstall = packages.filter(pkg => !installed.has(pkg));

  if (toInstall.length === 0) {
    result.skipped = packages;
    if (options.verbose) {
      console.log('✅ All packages already installed');
    }
    return result;
  }

  if (options.dryRun) {
    console.log(`[DRY RUN] Would install: ${toInstall.join(', ')}`);
    console.log(`[DRY RUN] Command: ${pm.addDevCommand(toInstall)}`);
    result.skipped = toInstall;
    return result;
  }

  // Install packages
  try {
    if (options.verbose) {
      console.log(`📦 Installing dev dependencies with ${pm.name}...`);
      console.log(`   ${toInstall.join(', ')}`);
    }

    const command = pm.addDevCommand(toInstall);
    execSync(command, {
      cwd: options.rootDir,
      stdio: options.verbose ? 'inherit' : 'pipe',
      encoding: 'utf8'
    });

    result.installed = toInstall;
    
    if (options.verbose) {
      console.log(`✅ Installed ${toInstall.length} package(s)`);
    }
  } catch (error: any) {
    const errorMsg = error.message || 'Unknown error';
    result.errors.push(errorMsg);
    console.error(`❌ Failed to install packages: ${errorMsg}`);
  }

  return result;
}

/**
 * Suggest packages to install based on framework and gaps
 */
export async function suggestPackages(
  framework: string,
  gaps: {
    noLinting?: boolean;
    noFormatting?: boolean;
    noTypeScript?: boolean;
    noTesting?: boolean;
  },
  rootDir: string
): Promise<string[]> {
  const suggestions: string[] = [];
  const installed = await getInstalledPackages(rootDir);

  // Check if TypeScript is present
  const hasTypeScript = installed.has('typescript');

  // Linting
  if (gaps.noLinting && !installed.has('eslint')) {
    suggestions.push('eslint');
    
    if (hasTypeScript) {
      if (!installed.has('@typescript-eslint/parser')) {
        suggestions.push('@typescript-eslint/parser');
      }
      if (!installed.has('@typescript-eslint/eslint-plugin')) {
        suggestions.push('@typescript-eslint/eslint-plugin');
      }
    }

    // Framework-specific ESLint configs
    if (framework === 'nextjs' && !installed.has('eslint-config-next')) {
      suggestions.push('eslint-config-next');
    } else if (framework === 'vite') {
      if (!installed.has('eslint-plugin-react')) {
        suggestions.push('eslint-plugin-react');
      }
      if (!installed.has('eslint-plugin-react-hooks')) {
        suggestions.push('eslint-plugin-react-hooks');
      }
    }
  }

  // Formatting
  if (gaps.noFormatting && !installed.has('prettier')) {
    suggestions.push('prettier');
  }

  // TypeScript
  if (gaps.noTypeScript) {
    if (!installed.has('typescript')) {
      suggestions.push('typescript');
    }
    if (!installed.has('@types/node')) {
      suggestions.push('@types/node');
    }
  }

  // Testing
  if (gaps.noTesting) {
    // Suggest Vitest for Vite projects, otherwise Node test runner (no install needed)
    if (framework === 'vite' && !installed.has('vitest')) {
      suggestions.push('vitest');
    }
  }

  return suggestions;
}

