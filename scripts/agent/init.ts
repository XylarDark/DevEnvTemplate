#!/usr/bin/env node

/**
 * Unified agent init — layer picker plus host AGENTS.md stub by default.
 *
 * Default: detect stack, choose layers, scaffold selected files, write AGENTS.md stub.
 * --advanced: run the legacy questionnaire that writes project.manifest.json.
 */

import * as readline from 'readline';
import * as path from 'path';
import { Command } from 'commander';
import StackDetector from '../tools/stack-detector';
import { createLogger } from '../utils/logger';
import {
  ALL_LAYERS,
  type AdoptionLayer,
  adoptLayers,
  parseLayerList,
} from './layers';
import AgentCLI from './cli';

const logger = createLogger({ context: 'agent-init' });

const LAYER_PROMPTS: Array<{ id: AdoptionLayer; label: string }> = [
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

export interface InitOptions {
  projectRoot?: string;
  templateRoot?: string;
  layers?: AdoptionLayer[];
  defaults?: boolean;
  dryRun?: boolean;
  advanced?: boolean;
}

function createReadline(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

async function promptLayers(rl: readline.Interface): Promise<AdoptionLayer[]> {
  console.log('\nChoose adoption layers (comma-separated numbers, Enter for all):\n');
  LAYER_PROMPTS.forEach((layer, index) => {
    console.log(`  ${index + 1}) ${layer.label}`);
  });
  console.log('');

  const answer = await ask(rl, '> ');
  if (!answer) {
    return [...ALL_LAYERS];
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

function resolveTemplateRoot(explicit?: string): string {
  if (explicit) {
    return path.resolve(explicit);
  }
  // Compiled: dist/scripts/agent/init.js -> repo root is three levels up.
  return path.resolve(__dirname, '..', '..', '..');
}

function printSummary(
  layers: AdoptionLayer[],
  summary: Awaited<ReturnType<typeof adoptLayers>>
): void {
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
  } else if (summary.agentsMd?.skippedReason) {
    console.log(`\nℹ️  AGENTS.md: ${summary.agentsMd.skippedReason}`);
  }
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const projectRoot = path.resolve(options.projectRoot ?? process.cwd());
  const templateRoot = resolveTemplateRoot(options.templateRoot);

  if (options.advanced) {
    const cli = new AgentCLI();
    await cli.run();
    return;
  }

  let layers = options.layers;
  let rl: readline.Interface | undefined;

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
  const detector = new StackDetector({ rootDir: projectRoot, quiet: true, mode: 'fast' });
  const stackReport = await detector.detect();
  await detector.saveReport(stackReport);

  const summary = await adoptLayers({
    projectRoot,
    templateRoot,
    layers,
    stackReport,
    dryRun: options.dryRun ?? false,
  });

  printSummary(layers, summary);
}

async function main(): Promise<void> {
  const program = new Command()
    .name('agent-init')
    .description('Adopt DevEnvTemplate layers and write a host AGENTS.md stub')
    .option(
      '--layers <list>',
      'Comma-separated layers: agent-context, operational-memory, doctor'
    )
    .option('--defaults', 'Use default layers without prompting (agent-context + operational-memory)')
    .option('--advanced', 'Run the legacy questionnaire (project.manifest.json)')
    .option('--dry-run', 'Show what would be copied without writing files')
    .option('--project-root <path>', 'Host project root (default: cwd)')
    .option('--template-root <path>', 'DevEnvTemplate root (default: package install path)')
    .parse();

  const opts = program.opts<{
    layers?: string;
    defaults?: boolean;
    advanced?: boolean;
    dryRun?: boolean;
    projectRoot?: string;
    templateRoot?: string;
  }>();

  try {
    await runInit({
      projectRoot: opts.projectRoot,
      templateRoot: opts.templateRoot,
      layers: parseLayerList(opts.layers) ?? undefined,
      defaults: opts.defaults,
      dryRun: opts.dryRun,
      advanced: opts.advanced,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default { runInit };
