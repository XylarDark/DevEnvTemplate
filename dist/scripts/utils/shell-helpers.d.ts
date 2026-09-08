/**
 * Shell Compatibility Utilities
 *
 * Provides cross-platform utilities for:
 * - Command execution with shell compatibility
 * - Windows PowerShell compatibility
 * - Command chaining alternatives
 * - Shell detection
 */
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
export declare function detectShell(): ShellType;
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
export declare function getCommandSeparator(): string;
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
export declare function execCommand(command: string, options?: {
    shell?: string;
    cwd?: string;
    encoding?: BufferEncoding;
}): Promise<string>;
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
export declare function formatCommand(commands: string[], shell?: ShellType): string;
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
export declare function supportsCommandChaining(shell?: ShellType): boolean;
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
export declare function getShellExample(bashExample: string, shell?: ShellType): string;
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
export declare function createCrossPlatformDocs(commands: string[]): {
    bash: string;
    powershell: string;
    description: string;
};
//# sourceMappingURL=shell-helpers.d.ts.map