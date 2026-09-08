"use strict";
/**
 * Path resolver utility for dual-path loading during migration.
 * Supports new paths (config/, packs/) with fallback to old paths (root, presets/).
 * Enhanced with project root detection for embedded usage.
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
exports.resolveConfigPath = resolveConfigPath;
exports.resolvePackPath = resolvePackPath;
exports.getAvailablePacks = getAvailablePacks;
exports.configExists = configExists;
exports.resolveProjectRoot = resolveProjectRoot;
exports.normalizePath = normalizePath;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Resolve config file path with dual-path support
 * @param configName - Config filename (e.g., 'cleanup.config.yaml')
 * @param workingDir - Working directory (defaults to cwd)
 * @returns Resolved config path
 */
function resolveConfigPath(configName, workingDir = process.cwd()) {
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
function resolvePackPath(packName, workingDir = path.join(__dirname, '../..')) {
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
function getAvailablePacks(workingDir = path.join(__dirname, '../..')) {
    const packs = new Set();
    // Check new packs directory
    const newPacksDir = path.join(workingDir, 'packs');
    if (fs.existsSync(newPacksDir)) {
        try {
            const files = fs.readdirSync(newPacksDir);
            files.filter(f => f.endsWith('.yaml')).forEach(f => packs.add(f));
        }
        catch (err) {
            // Ignore directory read errors
        }
    }
    // Check old presets directory
    const oldPresetsDir = path.join(workingDir, 'presets');
    if (fs.existsSync(oldPresetsDir)) {
        try {
            const files = fs.readdirSync(oldPresetsDir);
            files.filter(f => f.endsWith('.yaml')).forEach(f => packs.add(f));
        }
        catch (err) {
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
function configExists(configName, workingDir = process.cwd()) {
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
function resolveProjectRoot(startDir = process.cwd()) {
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
function normalizePath(filePath) {
    return path.normalize(filePath);
}
//# sourceMappingURL=path-resolver.js.map