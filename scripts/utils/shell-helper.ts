/**
 * Cross-platform shell command execution utility
 * Handles both bash/zsh and PowerShell command syntax
 */

import { execSync, ExecSyncOptions } from 'child_process';
import * as os from 'os';

export type ShellType = 'bash' | 'powershell' | 'unknown';

/**
 * Detect the current shell type
 */
export function detectShell(): ShellType {
  const platform = os.platform();
  const shell = process.env.SHELL || process.env.COMSPEC || '';

  if (platform === 'win32') {
    // Check if PowerShell
    if (shell.toLowerCase().includes('powershell') || shell.toLowerCase().includes('pwsh')) {
      return 'powershell';
    }
    // Default to PowerShell on Windows
    return 'powershell';
  }

  // Unix-like systems
  if (shell.includes('bash') || shell.includes('zsh') || shell.includes('sh')) {
    return 'bash';
  }

  return 'unknown';
}

/**
 * Execute a command with cross-platform compatibility
 * Automatically handles command chaining for different shells
 */
export function runCommand(
  command: string,
  options: ExecSyncOptions & { shellType?: ShellType } = {}
): string {
  const shellType = options.shellType || detectShell();
  const { shellType: _, ...execOptions } = options;

  // Normalize command for the detected shell
  let normalizedCommand = command;
  let shellPath: string | undefined;

  if (shellType === 'powershell') {
    // Replace && with ; for PowerShell
    normalizedCommand = command.replace(/&&/g, ';');
    // Use PowerShell as shell (Windows only)
    if (process.platform === 'win32') {
      shellPath = 'powershell.exe';
    }
  } else {
    // Use bash/sh for Unix-like systems
    if (process.platform !== 'win32') {
      shellPath = '/bin/bash';
    }
  }

  try {
    const execOpts: ExecSyncOptions = {
      encoding: 'utf8',
      stdio: 'pipe',
      ...execOptions,
    };
    
    // Add shell option if specified (Node.js supports this)
    if (shellPath) {
      (execOpts as any).shell = shellPath;
    }
    
    return execSync(normalizedCommand, execOpts).toString();
  } catch (error: any) {
    throw new Error(
      `Command failed: ${normalizedCommand}\n` +
      `Shell: ${shellType}\n` +
      `Error: ${error.message}`
    );
  }
}

/**
 * Chain multiple commands with appropriate separator
 */
export function chainCommands(commands: string[], shell?: ShellType): string {
  const shellType = shell || detectShell();
  const separator = shellType === 'powershell' ? ';' : '&&';
  return commands.join(` ${separator} `);
}

/**
 * Check if a command exists in PATH
 */
export function commandExists(command: string): boolean {
  try {
    if (detectShell() === 'powershell') {
      runCommand(`Get-Command ${command} -ErrorAction SilentlyContinue`, { shellType: 'powershell' });
    } else {
      runCommand(`which ${command}`, { shellType: 'bash' });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get platform-specific path separator
 */
export function getPathSeparator(): string {
  return os.platform() === 'win32' ? '\\' : '/';
}

/**
 * Normalize path for current platform
 */
export function normalizePath(path: string): string {
  const separator = getPathSeparator();
  return path.replace(/[/\\]/g, separator);
}

