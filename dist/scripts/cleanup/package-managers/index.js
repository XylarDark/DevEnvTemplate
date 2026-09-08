"use strict";
/**
 * Package Manager Registry
 * Exports all package manager implementations
 *
 * Focused on Node.js ecosystem (npm, yarn, pnpm) + Python (pip, poetry)
 * for indie developers and solo founders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoetryManager = exports.PipManager = exports.PnpmManager = exports.YarnManager = exports.NpmManager = exports.BasePackageManager = void 0;
exports.getPackageManager = getPackageManager;
const base_1 = require("./base");
Object.defineProperty(exports, "BasePackageManager", { enumerable: true, get: function () { return base_1.BasePackageManager; } });
const npm_1 = require("./npm");
Object.defineProperty(exports, "NpmManager", { enumerable: true, get: function () { return npm_1.NpmManager; } });
const yarn_1 = require("./yarn");
Object.defineProperty(exports, "YarnManager", { enumerable: true, get: function () { return yarn_1.YarnManager; } });
const pnpm_1 = require("./pnpm");
Object.defineProperty(exports, "PnpmManager", { enumerable: true, get: function () { return pnpm_1.PnpmManager; } });
const pip_1 = require("./pip");
Object.defineProperty(exports, "PipManager", { enumerable: true, get: function () { return pip_1.PipManager; } });
const poetry_1 = require("./poetry");
Object.defineProperty(exports, "PoetryManager", { enumerable: true, get: function () { return poetry_1.PoetryManager; } });
/**
 * Get package manager instance by name
 */
function getPackageManager(managerName, workingDir, dryRun) {
    const managers = {
        npm: npm_1.NpmManager,
        yarn: yarn_1.YarnManager,
        pnpm: pnpm_1.PnpmManager,
        pip: pip_1.PipManager,
        poetry: poetry_1.PoetryManager,
    };
    const ManagerClass = managers[managerName.toLowerCase()];
    if (!ManagerClass) {
        throw new Error(`Unknown package manager: ${managerName}. Supported: npm, yarn, pnpm, pip, poetry`);
    }
    return new ManagerClass(workingDir, dryRun);
}
//# sourceMappingURL=index.js.map