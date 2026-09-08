#!/usr/bin/env node

/**
 * Layer-aware template sync CLI.
 *
 * Dry run is the default. Pass --apply to copy files. The legacy .devenv git merge remains
 * available with --devenv-merge.
 */

import { Command } from 'commander';
import path from 'path';
import { promises as fs } from 'fs';
import StackDetector from '../tools/stack-detector';
import {
  SYNC_LAYER_NAMES,
  mergeDevenvFromTemplate,
  syncFromTemplate,
  type SyncLayerName,
} from '../tools/sync-from-template';

interface SyncCliOptions {
  layer?: string;
  template?: string;
  projectRoot?: string;
  apply?: boolean;
  dryRun?: boolean;
  devenvMerge?: boolean;
  json?: boolean;
}

function splitLayers(value?: string): SyncLayerName[] {
  if (!value || value.trim() === 'all') {
    return [...SYNC_LAYER_NAMES];
  }

  const layers = value
    .split(',')
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0) as SyncLayerName[];

  for (const layer of layers) {
    if (!SYNC_LAYER_NAMES.includes(layer)) {
      throw new Error(
        `Unknown layer "${layer}". Choose from: ${SYNC_LAYER_NAMES.join(', ')}, or all.`
      );
    }
  }

  return layers;
}

async function resolveTemplateRoot(template?: string): Promise<string> {
  const candidate = template ?? process.env.DEVENV_TEMPLATE_PATH;
  if (!candidate) {
    throw new Error(
      'Template path is required. Pass --template <path> or set DEVENV_TEMPLATE_PATH.'
    );
  }

  const resolved = path.resolve(candidate);
  if (!(await fs.stat(resolved).catch(() => null))) {
    throw new Error(`Template path does not exist: ${resolved}`);
  }

  return resolved;
}

function printHumanReport(plan: Awaited<ReturnType<typeof syncFromTemplate>>): void {
  const mode = plan.dryRun ? 'DRY RUN' : 'APPLY';
  console.log(`\nSync (${mode}) — layers: ${plan.layer.join(', ')}`);
  console.log('');

  if (plan.copied.length === 0 && plan.skipped.length === 0) {
    console.log('No file changes planned.');
  }

  const wouldChange = plan.actions.filter(
    action => action.action === 'copy' || action.action === 'update'
  );
  if (wouldChange.length > 0) {
    console.log('Would change:');
    for (const action of wouldChange) {
      const verb = action.action === 'copy' ? 'add' : 'update';
      console.log(`  ${verb}  ${action.relativePath}  (${action.reason})`);
    }
    console.log('');
  }

  const skipped = plan.actions.filter(action => action.action === 'skip');
  if (skipped.length > 0) {
    console.log('Skipped:');
    for (const action of skipped.slice(0, 20)) {
      console.log(`  skip  ${action.relativePath}  (${action.reason})`);
    }
    if (skipped.length > 20) {
      console.log(`  ... and ${skipped.length - 20} more`);
    }
    console.log('');
  }

  for (const warning of plan.warnings) {
    console.log(`Warning: ${warning}`);
  }

  for (const recommendation of plan.recommendations) {
    console.log(`Note: ${recommendation}`);
  }

  if (plan.dryRun) {
    console.log('No files were modified. Re-run with --apply to copy.');
  } else {
    console.log(`Applied ${plan.copied.length} change(s).`);
  }
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('devenv-sync')
    .description('Refresh allowlisted DevEnvTemplate layers into a host project')
    .option(
      '-l, --layer <name>',
      'layer to sync (agent-context, operational-memory, doctor, all)',
      'all'
    )
    .option('-t, --template <path>', 'path to the DevEnvTemplate checkout')
    .option('-C, --project-root <path>', 'host project directory', process.cwd())
    .option('--apply', 'copy files (without this flag the run is a dry run)', false)
    .option('--dry-run', 'preview changes without writing (default)', false)
    .option('--devenv-merge', 'git-merge .devenv from the template (legacy embedded mode)', false)
    .option('--json', 'emit the plan as JSON on stdout', false)
    .parse(process.argv);

  const options = program.opts<SyncCliOptions>();

  if (options.apply && options.dryRun) {
    console.error('Refusing to run: --apply and --dry-run contradict each other.');
    process.exit(1);
  }

  const isDryRun = options.apply !== true || options.dryRun === true;
  const projectRoot = path.resolve(options.projectRoot ?? process.cwd());
  const templateRoot = await resolveTemplateRoot(options.template);

  if (options.devenvMerge) {
    const devenvDir = path.join(projectRoot, '.devenv');
    const mergeResult = await mergeDevenvFromTemplate({
      templateRoot,
      devenvDir,
      dryRun: isDryRun,
    });

    if (options.json) {
      console.log(JSON.stringify(mergeResult, null, 2));
    } else {
      console.log(mergeResult.message);
      if (mergeResult.preserved.length > 0) {
        console.log(`Preserved project files: ${mergeResult.preserved.join(', ')}`);
      }
    }
    return;
  }

  const layers = splitLayers(options.layer);

  let stackReport;
  if (layers.includes('agent-context')) {
    const detector = new StackDetector({ rootDir: projectRoot, quiet: options.json === true });
    stackReport = await detector.detect();
  }

  const result = await syncFromTemplate({
    projectRoot,
    templateRoot,
    layers,
    dryRun: isDryRun,
    stackReport,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHumanReport(result);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
