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
exports.PoetryManager = void 0;
const fs = __importStar(require("fs/promises"));
const base_1 = require("./base");
/**
 * Poetry package manager handler (pyproject.toml)
 */
class PoetryManager extends base_1.BasePackageManager {
    getPackageFile() {
        return 'pyproject.toml';
    }
    getLockFile() {
        return 'poetry.lock';
    }
    async readPackageFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    }
    async writePackageFile(filePath, content) {
        await fs.writeFile(filePath, content);
    }
    async removeDependencies(content, rule) {
        let modified = false;
        const removedDeps = [];
        let updatedContent = content;
        if (rule.remove_deps) {
            rule.remove_deps.forEach(dep => {
                // Match dependency line in TOML format
                const regex = new RegExp(`^${dep}\\s*=.*$`, 'gm');
                if (regex.test(updatedContent)) {
                    updatedContent = updatedContent.replace(regex, '');
                    modified = true;
                    removedDeps.push({ name: dep, section: 'pyproject.toml' });
                }
            });
        }
        // Update by reference if modified
        if (modified) {
            content = updatedContent;
        }
        return { modified, removedDeps };
    }
}
exports.PoetryManager = PoetryManager;
//# sourceMappingURL=poetry.js.map