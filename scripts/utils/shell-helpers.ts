/**
 * Shell Compatibility Utilities
 * 
 * Provides cross-platform utilities for:
 * - Command execution with shell compatibility
 * - Windows PowerShell compatibility
 * - Command chaining alternatives
 * - Shell detection
 */

import { execSync } from 'child_process';
import * as os from 'os';

export type ShellType = 'bash' | 'powershell' | 'cmd' | 'zsh' | 'fish' | 'unknown';

/**
 * Detect shell type
 * 
 * @returns Detected shell type
 * 
 * @example
 * ```typescript
 * const shell = detectShell();
 * if (shell === 'powershell') {
 *   // Use PowerShell-specific syntax
 * }
 * ```
 */
export function detectShell(): ShellType {
  const platform = os.platform();
  const shell = process.env.SHELL || process.env.COMSPEC || '';
  
  if (platform === 'win32') {
    // Windows
    if (shell.toLowerCase().includes('powershell')) {
      return 'powershell';
    }
    if (shell.toLowerCase().includes('cmd')) {
      return 'cmd';
    }
    // Default to PowerShell on Windows
    return 'powershell';
  }
  
  // Unix-like systems
  if (shell.includes('bash')) {
    return 'bash';
  }
  if (shell.includes('zsh')) {
    return 'zsh';
  }
  if (shell.includes('fish')) {
    return 'fish';
  }
  
  return 'unknown';
}

/**
 * Get shell-specific command separator
 * 
 * @returns Command separator for the current shell
 * 
 * @example
 * ```typescript
 * const separator = getCommandSeparator();
 * const command = `cd /path${separator} npm run build`;
 * ```
 */
export function getCommandSeparator(): string {
  const shell = detectShell();
  
  switch (shell) {
    case 'powershell':
    case 'cmd':
      return ';';
    case 'bash':
    case 'zsh':
    case 'fish':
      return ' && ';
    default:
      return ' && ';
  }
}

/**
 * Execute command with shell compatibility
 * 
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Command output
 * 
 * @example
 * ```typescript
 * const output = await execCommand('npm run build', { shell: 'bash' });
 * ```
 */
export function execCommand(
  command: string,
  options: { shell?: string; cwd?: string; encoding?: BufferEncoding } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const shell = options.shell || detectShell();
      const cwd = options.cwd || process.cwd();
      const encoding = options.encoding || 'utf-8';
      
      // Adjust command for shell type
      let adjustedCommand = command;
      if (shell === 'powershell' || shell === 'cmd') {
        // Replace && with ; for Windows shells
        adjustedCommand = command.replace(/\s*&&\s*/g, '; ');
      }
      
      const output = execSync(adjustedCommand, {
        cwd,
        encoding,
        shell: shell === 'powershell' ? 'powershell.exe' : undefined
      });
      
      resolve(output.toString());
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format command for shell-specific execution
 * 
 * @param commands - Array of commands to chain
 * @param shell - Target shell (default: auto-detect)
 * @returns Formatted command string
 * 
 * @example
 * ```typescript
 * // Bash/Linux
 * const bashCmd = formatCommand(['cd /path', 'npm run build'], 'bash');
 * // Result: "cd /path && npm run build"
 * 
 * // PowerShell
 * const psCmd = formatCommand(['cd C:\path', 'npm run build'], 'powershell');
 * // Result: "cd C:\path; npm run build"
 * ```
 */
export function formatCommand(commands: string[], shell?: ShellType): string {
  const targetShell = shell || detectShell();
  const separator = targetShell === 'powershell' || targetShell === 'cmd' ? '; ' : ' && ';
  return commands.join(separator);
}

/**
 * Check if shell supports command chaining with &&
 * 
 * @param shell - Shell type to check (default: auto-detect)
 * @returns True if shell supports && chaining
 * 
 * @example
 * ```typescript
 * if (supportsCommandChaining()) {
 *   // Use && syntax
 * } else {
 *   // Use ; syntax
 * }
 * ```
 */
export function supportsCommandChaining(shell?: ShellType): boolean {
  const targetShell = shell || detectShell();
  return targetShell !== 'powershell' && targetShell !== 'cmd';
}

/**
 * Get shell-specific example for documentation
 * 
 * @param bashExample - Bash/Linux example command
 * @param shell - Target shell (default: auto-detect)
 * @returns Shell-specific example
 * 
 * @example
 * ```typescript
 * const example = getShellExample('cd /path && npm run build');
 * // On Windows: "cd C:\path; npm run build"
 * // On Linux: "cd /path && npm run build"
 * ```
 */
export function getShellExample(bashExample: string, shell?: ShellType): string {
  const targetShell = shell || detectShell();
  
  if (targetShell === 'powershell' || targetShell === 'cmd') {
    // Replace && with ; for Windows
    return bashExample.replace(/\s*&&\s*/g, '; ');
  }
  
  return bashExample;
}

/**
 * Create cross-platform command documentation
 * 
 * @param commands - Commands to document
 * @returns Documentation with shell-specific examples
 * 
 * @example
 * ```typescript
 * const docs = createCrossPlatformDocs(['cd /path', 'npm run build']);
 * // Returns object with bash and powershell examples
 * ```
 */
export function createCrossPlatformDocs(commands: string[]): {
  bash: string;
  powershell: string;
  description: string;
} {
  const bashCmd = formatCommand(commands, 'bash');
  const psCmd = formatCommand(commands, 'powershell');
  
  return {
    bash: bashCmd,
    powershell: psCmd,
    description: `Run these commands in sequence. Use '&&' on Linux/macOS, ';' on Windows PowerShell.`
  };
}

