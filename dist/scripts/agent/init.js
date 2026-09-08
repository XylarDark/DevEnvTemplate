#!/usr/bin/env node
"use strict";
/**
 * Unified agent init — layer picker plus host AGENTS.md stub by default.
 *
 * Default: detect stack, choose layers, scaffold selected files, write AGENTS.md stub.
 * --advanced: run the legacy questionnaire that writes project.manifest.json.
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
exports.runInit = runInit;
const readline = __importStar(require("readline"));
const path = __importStar(require("path"));
const commander_1 = require("commander");
const stack_detector_1 = __importDefault(require("../tools/stack-detector"));
const logger_1 = require("../utils/logger");
const layers_1 = require("./layers");
const cli_1 = __importDefault(require("./cli"));
const logger = (0, logger_1.createLogger)({ context: 'agent-init' });
const LAYER_PROMPTS = [
    {
        id: 'agent-context',
        label: 'Agent context — AGENTS.md stub, skills, glob-scoped rules',
    },
    {
        id: 'operational-memory',
        label: 'Operational memory — KNOWN_ERRORS, automation-gaps, DOCS_LAYOUT',
    },
    {
        id: 'doctor',
        label: 'Doctor (Node) — health check vendored under .devenv/',
    },
];
function createReadline() {
    return readline.createInterface({ input: process.stdin, output: process.stdout });
}
function ask(rl, question) {
    return new Promise(resolve => {
        rl.question(question, answer => resolve(answer.trim()));
    });
}
async function promptLayers(rl) {
    console.log('\nChoose adoption layers (comma-separated numbers, Enter for all):\n');
    LAYER_PROMPTS.forEach((layer, index) => {
        console.log(`  ${index + 1}) ${layer.label}`);
    });
    console.log('');
    const answer = await ask(rl, '> ');
    if (!answer) {
        return [...layers_1.ALL_LAYERS];
    }
    const indices = answer
        .split(',')
        .map(part => parseInt(part.trim(), 10) - 1)
        .filter(index => !Number.isNaN(index) && index >= 0 && index < LAYER_PROMPTS.length);
    if (indices.length === 0) {
        logger.warn('No valid selections — using agent-context only.');
        return ['agent-context'];
    }
    return indices.map(index => LAYER_PROMPTS[index].id);
}
function resolveTemplateRoot(explicit) {
    if (explicit) {
        return path.resolve(explicit);
    }
    // Compiled: dist/scripts/agent/init.js -> repo root is three levels up.
    return path.resolve(__dirname, '..', '..', '..');
}
function printSummary(layers, summary) {
    console.log('\nAdopted layers:');
    for (const layer of layers) {
        console.log(`  - ${layer}`);
    }
    for (const result of summary.results) {
        if (result.copied.length > 0) {
            console.log(`\n${result.layer}: copied ${result.copied.length} file(s)`);
            for (const file of result.copied.slice(0, 8)) {
                console.log(`  + ${file}`);
            }
            if (result.copied.length > 8) {
                console.log(`  ... and ${result.copied.length - 8} more`);
            }
        }
        for (const note of result.recommendations) {
            console.log(`  → ${note}`);
        }
    }
    if (summary.agentsMd?.written) {
        console.log(`\n✅ Wrote host AGENTS.md stub at ${summary.agentsMd.path}`);
    }
    else if (summary.agentsMd?.skippedReason) {
        console.log(`\nℹ️  AGENTS.md: ${summary.agentsMd.skippedReason}`);
    }
}
async function runInit(options = {}) {
    const projectRoot = path.resolve(options.projectRoot ?? process.cwd());
    const templateRoot = resolveTemplateRoot(options.templateRoot);
    if (options.advanced) {
        const cli = new cli_1.default();
        await cli.run();
        return;
    }
    let layers = options.layers;
    let rl;
    if (!layers && !options.defaults) {
        rl = createReadline();
        layers = await promptLayers(rl);
    }
    if (!layers) {
        layers = ['agent-context', 'operational-memory'];
    }
    if (rl) {
        rl.close();
    }
    logger.info('Detecting project stack (fast mode)...');
    const detector = new stack_detector_1.default({ rootDir: projectRoot, quiet: true, mode: 'fast' });
    const stackReport = await detector.detect();
    await detector.saveReport(stackReport);
    const summary = await (0, layers_1.adoptLayers)({
        projectRoot,
        templateRoot,
        layers,
        stackReport,
        dryRun: options.dryRun ?? false,
    });
    printSummary(layers, summary);
}
async function main() {
    const program = new commander_1.Command()
        .name('agent-init')
        .description('Adopt DevEnvTemplate layers and write a host AGENTS.md stub')
        .option('--layers <list>', 'Comma-separated layers: agent-context, operational-memory, doctor')
        .option('--defaults', 'Use default layers without prompting (agent-context + operational-memory)')
        .option('--advanced', 'Run the legacy questionnaire (project.manifest.json)')
        .option('--dry-run', 'Show what would be copied without writing files')
        .option('--project-root <path>', 'Host project root (default: cwd)')
        .option('--template-root <path>', 'DevEnvTemplate root (default: package install path)')
        .parse();
    const opts = program.opts();
    try {
        await runInit({
            projectRoot: opts.projectRoot,
            templateRoot: opts.templateRoot,
            layers: (0, layers_1.parseLayerList)(opts.layers) ?? undefined,
            defaults: opts.defaults,
            dryRun: opts.dryRun,
            advanced: opts.advanced,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(message);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
exports.default = { runInit };
//# sourceMappingURL=init.js.map