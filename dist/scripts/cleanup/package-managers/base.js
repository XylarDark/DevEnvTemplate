"use strict";
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
exports.BasePackageManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Base class for all package managers
 * Provides shared logic for dependency pruning and lock file management
 */
class BasePackageManager {
    workingDir;
    dryRun;
    constructor(workingDir, dryRun) {
        this.workingDir = workingDir;
        this.dryRun = dryRun;
    }
    /**
     * Get the manager name (defaults to class name without 'Manager' suffix)
     */
    getManagerName() {
        return this.constructor.name.replace('Manager', '').toLowerCase();
    }
    /**
     * Main pruning logic - shared across all package managers
     */
    async prune(rule) {
        const actions = [];
        const packageFilePath = path.join(this.workingDir, this.getPackageFile());
        try {
            // Read package file
            const content = await this.readPackageFile(packageFilePath);
            // Remove dependencies
            const { modified, removedDeps } = await this.removeDependencies(content, rule);
            // Write back if modified
            if (modified && !this.dryRun) {
                await this.writePackageFile(packageFilePath, content);
                await this.removeLockFile();
            }
            // Record actions
            removedDeps.forEach(dep => {
                actions.push({
                    type: 'dependency_remove',
                    rule: rule.id,
                    manager: this.getManagerName(),
                    dependency: dep.name,
                    section: dep.section,
                    dryRun: this.dryRun,
                });
            });
        }
        catch (error) {
            throw new Error(`Failed to prune ${this.getManagerName()}: ${error.message}`, {
                cause: error,
            });
        }
        return { actions };
    }
    /**
     * Remove lock file if it exists
     */
    async removeLockFile() {
        const lockFile = this.getLockFile();
        if (!lockFile)
            return;
        const lockPath = path.join(this.workingDir, lockFile);
        try {
            await fs.access(lockPath);
            await fs.unlink(lockPath);
        }
        catch {
            // Lock file doesn't exist, ignore
        }
    }
}
exports.BasePackageManager = BasePackageManager;
//# sourceMappingURL=base.js.map