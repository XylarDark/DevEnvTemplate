"use strict";
/**
 * Shell Compatibility Utilities
 *
 * Provides cross-platform utilities for:
 * - Command execution with shell compatibility
 * - Windows PowerShell compatibility
 * - Command chaining alternatives
 * - Shell detection
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectShell = detectShell;
exports.getCommandSeparator = getCommandSeparator;
exports.execCommand = execCommand;
exports.formatCommand = formatCommand;
exports.supportsCommandChaining = supportsCommandChaining;
exports.getShellExample = getShellExample;
exports.createCrossPlatformDocs = createCrossPlatformDocs;
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
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
function detectShell() {
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
function getCommandSeparator() {
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
function execCommand(command, options = {}) {
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
            const output = (0, child_process_1.execSync)(adjustedCommand, {
                cwd,
                encoding,
                shell: shell === 'powershell' ? 'powershell.exe' : undefined,
            });
            resolve(output.toString());
        }
        catch (error) {
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
function formatCommand(commands, shell) {
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
function supportsCommandChaining(shell) {
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
function getShellExample(bashExample, shell) {
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
function createCrossPlatformDocs(commands) {
    const bashCmd = formatCommand(commands, 'bash');
    const psCmd = formatCommand(commands, 'powershell');
    return {
        bash: bashCmd,
        powershell: psCmd,
        description: `Run these commands in sequence. Use '&&' on Linux/macOS, ';' on Windows PowerShell.`,
    };
}
//# sourceMappingURL=shell-helpers.js.map