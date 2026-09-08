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
exports.PipManager = void 0;
const fs = __importStar(require("fs/promises"));
const base_1 = require("./base");
/**
 * Pip package manager handler (requirements.txt)
 */
class PipManager extends base_1.BasePackageManager {
    getPackageFile() {
        return 'requirements.txt';
    }
    getLockFile() {
        return null; // Pip doesn't have a standard lock file
    }
    async readPackageFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        return content.split('\n');
    }
    async writePackageFile(filePath, content) {
        await fs.writeFile(filePath, content.join('\n'));
    }
    async removeDependencies(lines, rule) {
        let modified = false;
        const removedDeps = [];
        if (rule.remove_deps) {
            const filteredLines = lines.filter(line => {
                const trimmed = line.trim();
                // Keep empty lines and comments
                if (!trimmed || trimmed.startsWith('#'))
                    return true;
                // Check if this line contains any of the packages to remove
                const shouldRemove = rule.remove_deps.some(dep => {
                    // Handle various pip formats (with version, extras, etc.)
                    return (trimmed.startsWith(dep) ||
                        trimmed.startsWith(dep.replace('-', '_')) ||
                        trimmed.includes(dep + '==') ||
                        trimmed.includes(dep + '>=') ||
                        trimmed.includes(dep + '['));
                });
                if (shouldRemove) {
                    modified = true;
                    removedDeps.push({ name: trimmed, section: 'requirements.txt' });
                    return false;
                }
                return true;
            });
            if (modified) {
                // Update the lines array in place
                lines.length = 0;
                lines.push(...filteredLines);
            }
        }
        return { modified, removedDeps };
    }
}
exports.PipManager = PipManager;
//# sourceMappingURL=pip.js.map