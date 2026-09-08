"use strict";
/**
 * Documentation Organizer Utility
 *
 * Automatically detects and organizes markdown files into appropriate directories
 * based on configurable rules to prevent documentation clutter in project root.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDocsConfig = loadDocsConfig;
exports.matchesPattern = matchesPattern;
exports.determineTargetDirectory = determineTargetDirectory;
exports.detectMisplacedDocs = detectMisplacedDocs;
exports.organizeDocumentation = organizeDocumentation;
exports.validateOrganization = validateOrganization;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const path_resolver_1 = require("./path-resolver");
const child_process_1 = require("child_process");
/**
 * Load documentation organization configuration
 */
async function loadDocsConfig(projectRoot) {
    // Try project-specific config first (.devenv/config/ or project root)
    const projectConfigPath = (0, path_resolver_1.resolveConfigPath)('docs-organization.yaml', projectRoot);
    // Try .devenv default config
    const devenvRoot = path.resolve(__dirname, '../../');
    const defaultConfigPath = path.join(devenvRoot, 'config', 'docs-organization.yaml');
    let configPath;
    let configContent;
    // Try project config first
    try {
        await fs_1.promises.access(projectConfigPath);
        configPath = projectConfigPath;
        configContent = await fs_1.promises.readFile(configPath, 'utf8');
    }
    catch {
        // Fallback to default config
        try {
            configPath = defaultConfigPath;
            configContent = await fs_1.promises.readFile(configPath, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to load docs-organization.yaml: ${error.message}`, {
                cause: error,
            });
        }
    }
    const config = yaml_1.default.parse(configContent);
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
function matchesPattern(filename, pattern) {
    // Convert pattern to regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filename);
}
/**
 * Determine target directory for a markdown file
 */
function determineTargetDirectory(filename, config, projectRoot) {
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
async function detectMisplacedDocs(projectRoot) {
    const misplaced = [];
    try {
        const files = await fs_1.promises.readdir(projectRoot);
        const config = await loadDocsConfig(projectRoot);
        for (const file of files) {
            // Only check .md files
            if (!file.endsWith('.md')) {
                continue;
            }
            const filePath = path.join(projectRoot, file);
            const stats = await fs_1.promises.stat(filePath);
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
    }
    catch (error) {
        throw new Error(`Failed to detect misplaced docs: ${error.message}`, { cause: error });
    }
    return misplaced;
}
/**
 * Check if a file is tracked by git
 */
function isGitTracked(filePath, projectRoot) {
    try {
        const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
        (0, child_process_1.execSync)(`git ls-files --error-unmatch "${relativePath}"`, {
            cwd: projectRoot,
            stdio: 'ignore',
        });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Organize documentation files
 */
async function organizeDocumentation(projectRoot, dryRun = true) {
    const result = {
        success: true,
        filesToMove: [],
        conflicts: [],
        errors: [],
        dryRun,
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
                    await fs_1.promises.access(targetDir);
                }
                catch {
                    await fs_1.promises.mkdir(targetDir, { recursive: true });
                }
            }
            // Check for conflicts
            try {
                await fs_1.promises.access(targetPath);
                result.conflicts.push({
                    source: sourcePath,
                    target: targetPath,
                    message: `Target file already exists: ${targetPath}`,
                });
                continue;
            }
            catch {
                // File doesn't exist, good to proceed
            }
            result.filesToMove.push({
                source: sourcePath,
                target: targetPath,
                targetDir,
                reason,
            });
            // Perform move if not dry run
            if (!dryRun) {
                try {
                    // Check if file is git-tracked
                    const isTracked = isGitTracked(sourcePath, projectRoot);
                    // Move file
                    await fs_1.promises.rename(sourcePath, targetPath);
                    // Stage move in git if tracked
                    if (isTracked) {
                        try {
                            (0, child_process_1.execSync)(`git add "${path.relative(projectRoot, targetPath).replace(/\\/g, '/')}"`, {
                                cwd: projectRoot,
                                stdio: 'ignore',
                            });
                            (0, child_process_1.execSync)(`git add "${path.relative(projectRoot, sourcePath).replace(/\\/g, '/')}"`, {
                                cwd: projectRoot,
                                stdio: 'ignore',
                            });
                        }
                        catch (gitError) {
                            // Git staging failed, but file was moved
                            result.errors.push(`Failed to stage git move for ${filename}: ${gitError}`);
                        }
                    }
                }
                catch (moveError) {
                    result.errors.push(`Failed to move ${filename}: ${moveError.message}`);
                    result.success = false;
                }
            }
        }
    }
    catch (error) {
        result.errors.push(`Organization failed: ${error.message}`);
        result.success = false;
    }
    return result;
}
/**
 * Validate if organization is needed
 */
async function validateOrganization(projectRoot) {
    try {
        const misplacedFiles = await detectMisplacedDocs(projectRoot);
        const files = await fs_1.promises.readdir(projectRoot);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        return {
            needsOrganization: misplacedFiles.length > 0,
            misplacedFiles,
            totalFiles: mdFiles.length,
        };
    }
    catch (error) {
        throw new Error(`Validation failed: ${error.message}`, { cause: error });
    }
}
//# sourceMappingURL=docs-organizer.js.map