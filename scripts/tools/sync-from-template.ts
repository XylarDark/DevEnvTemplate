#!/usr/bin/env node

/**
 * Layer-aware sync from DevEnvTemplate into a host project.
 *
 * Copies only allowlisted paths for the chosen adoption layer. Dry-run is the default;
 * pass apply=true to write files. Never overwrites the host root AGENTS.md, never copies
 * MCP configs, and never copies retired always-applied Cursor rules.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import type { StackReport } from '../types/gaps';
import { createLogger } from '../utils/logger';
import {
  RETIRED_ALWAYS_ON_FILES,
  STACK_SCOPED_FILES,
  shouldIncludeRule,
} from './cursor-rules-adapter';
import { integrateCursorRules } from './cursor-rules-integration';

const logger = createLogger({ context: 'sync-from-template' });

export const SYNC_LAYER_NAMES = ['agent-context', 'operational-memory', 'doctor'] as const;
export type SyncLayerName = (typeof SYNC_LAYER_NAMES)[number];

export interface SyncLayerPathSpec {
  src: string;
  kind: 'file' | 'directory' | 'skills' | 'cursor-rules';
  overwrite?: boolean;
}

export interface SyncLayerSpec {
  description: string;
  requiresDevenv?: boolean;
  preserveInDevenv?: string[];
  paths: SyncLayerPathSpec[];
  optionalSkillGroups?: Record<string, string>;
}

export interface SyncLayersConfig {
  globalNeverCopy: string[];
  layers: Record<SyncLayerName, SyncLayerSpec>;
}

export interface SyncAction {
  layer: SyncLayerName;
  relativePath: string;
  action: 'copy' | 'skip' | 'update';
  reason: string;
}

export interface SyncOptions {
  projectRoot: string;
  templateRoot: string;
  layers: SyncLayerName[];
  dryRun?: boolean;
  stackReport?: StackReport;
  configPath?: string;
}

export interface SyncResult {
  layer: SyncLayerName[];
  dryRun: boolean;
  actions: SyncAction[];
  copied: string[];
  skipped: string[];
  warnings: string[];
  recommendations: string[];
}

const DEFAULT_STACK_REPORT: StackReport = {
  technologies: [],
  configurations: [],
  frameworks: { type: 'vanilla', version: null, dirs: [] },
  tooling: {
    testing: { present: false, frameworks: [] },
    linting: { present: false, configs: [] },
    formatting: { present: false, configs: [] },
  },
  scripts: { detected: [], missing: [] },
  files: { configs: [], key_patterns: [] },
  quality: {
    linting: false,
    testing: false,
    typescript: false,
    security: false,
    formatting: false,
  },
  ci: { present: false },
};

const DEVENV_PRESERVE_FILES = [
  'health-report.json',
  'gaps-report.md',
  'stack-report.json',
  'health-before.json',
  'health-after.json',
  'input.txt',
  'gaps-report.json',
];

async function exists(target: string): Promise<boolean> {
  return fs
    .access(target)
    .then(() => true)
    .catch(() => false);
}

async function loadSyncConfig(configPath: string): Promise<SyncLayersConfig> {
  const raw = await fs.readFile(configPath, 'utf8');
  return JSON.parse(raw) as SyncLayersConfig;
}

function resolveSyncConfigPath(templateRoot: string, configPath?: string): string {
  return configPath ?? path.join(templateRoot, 'config', 'sync-layers.json');
}

function isBlockedPath(relativePath: string, globalNeverCopy: string[]): boolean {
  const normalized = relativePath.replace(/\\/g, '/');
  return globalNeverCopy.some(blocked => normalized === blocked || normalized.endsWith(`/${blocked}`));
}

async function readRuleAlwaysApply(rulePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(rulePath, 'utf8');
    return /^alwaysApply:\s*true/m.test(content);
  } catch {
    return false;
  }
}

async function planSkillsSync(
  templateRoot: string,
  projectRoot: string,
  layer: SyncLayerName,
  overwrite: boolean,
  optionalGroups?: Record<string, string>
): Promise<SyncAction[]> {
  const actions: SyncAction[] = [];
  const skillRoots: string[] = [path.join(templateRoot, '.agents', 'skills')];

  if (optionalGroups) {
    for (const groupPath of Object.values(optionalGroups)) {
      const absolute = path.join(templateRoot, groupPath);
      if (await exists(absolute)) {
        skillRoots.push(absolute);
      }
    }
  }

  for (const skillsRoot of skillRoots) {
    let entries;
    try {
      entries = await fs.readdir(skillsRoot, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const relativeSkill = path.posix.join('.agents/skills', entry.name, 'SKILL.md');
      const source = path.join(skillsRoot, entry.name, 'SKILL.md');
      const destination = path.join(projectRoot, relativeSkill);

      if (!(await exists(source))) {
        continue;
      }

      if ((await exists(destination)) && !overwrite) {
        actions.push({
          layer,
          relativePath: relativeSkill,
          action: 'skip',
          reason: 'host already has this skill',
        });
        continue;
      }

      actions.push({
        layer,
        relativePath: relativeSkill,
        action: (await exists(destination)) ? 'update' : 'copy',
        reason: overwrite ? 'refresh skill from template' : 'add missing skill from template',
      });
    }
  }

  return actions;
}

async function planCursorRulesSync(
  templateRoot: string,
  projectRoot: string,
  layer: SyncLayerName,
  stackReport: StackReport,
  overwrite: boolean
): Promise<SyncAction[]> {
  const actions: SyncAction[] = [];
  const templateRulesDir = path.join(templateRoot, '.cursor', 'rules');
  const projectRulesDir = path.join(projectRoot, '.cursor', 'rules');

  for (const ruleFile of STACK_SCOPED_FILES) {
    if (!shouldIncludeRule(ruleFile, stackReport)) {
      continue;
    }

    const source = path.join(templateRulesDir, ruleFile);
    const destination = path.join(projectRulesDir, ruleFile);
    const relative = path.posix.join('.cursor/rules', ruleFile);

    if (!(await exists(source))) {
      continue;
    }

    if (await readRuleAlwaysApply(source)) {
      actions.push({
        layer,
        relativePath: relative,
        action: 'skip',
        reason: 'always-applied rules are never copied',
      });
      continue;
    }

    if ((await exists(destination)) && !overwrite) {
      actions.push({
        layer,
        relativePath: relative,
        action: 'skip',
        reason: 'host already has this rule',
      });
      continue;
    }

    actions.push({
      layer,
      relativePath: relative,
      action: (await exists(destination)) ? 'update' : 'copy',
      reason: 'stack-scoped rule from template',
    });
  }

  for (const retired of RETIRED_ALWAYS_ON_FILES) {
    const source = path.join(templateRulesDir, retired);
    if (await exists(source)) {
      actions.push({
        layer,
        relativePath: path.posix.join('.cursor/rules', retired),
        action: 'skip',
        reason: 'retired always-on rule; migrate to AGENTS.md and skills instead',
      });
    }
  }

  return actions;
}

async function planFileSync(
  templateRoot: string,
  projectRoot: string,
  layer: SyncLayerName,
  relativePath: string,
  overwrite: boolean,
  globalNeverCopy: string[]
): Promise<SyncAction | null> {
  if (isBlockedPath(relativePath, globalNeverCopy)) {
    return {
      layer,
      relativePath,
      action: 'skip',
      reason: 'path is on the global never-copy list',
    };
  }

  const source = path.join(templateRoot, relativePath);
  const destination = path.join(projectRoot, relativePath);

  if (!(await exists(source))) {
    return null;
  }

  if ((await exists(destination)) && !overwrite) {
    return {
      layer,
      relativePath,
      action: 'skip',
      reason: 'host already has this file',
    };
  }

  return {
    layer,
    relativePath,
    action: (await exists(destination)) ? 'update' : 'copy',
    reason: overwrite ? 'refresh from template' : 'add missing entry shape from template',
  };
}

async function planDirectorySync(
  templateRoot: string,
  destinationRoot: string,
  layer: SyncLayerName,
  relativePath: string,
  overwrite: boolean,
  globalNeverCopy: string[]
): Promise<SyncAction[]> {
  const actions: SyncAction[] = [];
  const sourceDir = path.join(templateRoot, relativePath);

  if (!(await exists(sourceDir))) {
    return actions;
  }

  async function walk(currentSource: string, currentRelative: string): Promise<void> {
    const entries = await fs.readdir(currentSource, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelative = currentRelative
        ? path.posix.join(currentRelative, entry.name)
        : entry.name;

      if (isBlockedPath(entryRelative, globalNeverCopy)) {
        actions.push({
          layer,
          relativePath: entryRelative,
          action: 'skip',
          reason: 'path is on the global never-copy list',
        });
        continue;
      }

      const sourcePath = path.join(currentSource, entry.name);
      const destinationPath = path.join(destinationRoot, entryRelative);

      if (entry.isDirectory()) {
        await walk(sourcePath, entryRelative);
        continue;
      }

      if (entryRelative.endsWith('.mdc') && (await readRuleAlwaysApply(sourcePath))) {
        actions.push({
          layer,
          relativePath: entryRelative,
          action: 'skip',
          reason: 'always-applied rules are never copied',
        });
        continue;
      }

      if ((await exists(destinationPath)) && !overwrite) {
        actions.push({
          layer,
          relativePath: entryRelative,
          action: 'skip',
          reason: 'host already has this file',
        });
        continue;
      }

      actions.push({
        layer,
        relativePath: entryRelative,
        action: (await exists(destinationPath)) ? 'update' : 'copy',
        reason: overwrite ? 'refresh from template' : 'add missing file from template',
      });
    }
  }

  await walk(sourceDir, relativePath.replace(/\\/g, '/'));
  return actions;
}

async function copyFile(source: string, destination: string): Promise<void> {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function applyAction(
  templateRoot: string,
  projectRoot: string,
  action: SyncAction
): Promise<void> {
  const source = path.join(templateRoot, action.relativePath);
  const destination = path.join(projectRoot, action.relativePath);
  await copyFile(source, destination);
}

export async function planLayerSync(options: SyncOptions): Promise<SyncResult> {
  const {
    projectRoot,
    templateRoot,
    layers,
    dryRun = true,
    stackReport = DEFAULT_STACK_REPORT,
  } = options;

  const config = await loadSyncConfig(resolveSyncConfigPath(templateRoot, options.configPath));
  const actions: SyncAction[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (await exists(path.join(projectRoot, 'AGENTS.md'))) {
    recommendations.push(
      'Host AGENTS.md is preserved. Review template changes manually if your working agreements need updating.'
    );
  }

  for (const layerName of layers) {
    const layer = config.layers[layerName];
    if (!layer) {
      warnings.push(`Unknown layer "${layerName}"; skipping.`);
      continue;
    }

    let destinationRoot = projectRoot;

    if (layer.requiresDevenv) {
      const devenvDir = path.join(projectRoot, '.devenv');
      if (!(await exists(devenvDir))) {
        warnings.push(
          `Layer "${layerName}" applies only when .devenv/ exists. Skipping doctor sync.`
        );
        continue;
      }
      destinationRoot = devenvDir;
    }

    for (const spec of layer.paths) {
      const overwrite = spec.overwrite === true;

      switch (spec.kind) {
        case 'skills':
          actions.push(
            ...(await planSkillsSync(
              templateRoot,
              destinationRoot,
              layerName,
              overwrite,
              layer.optionalSkillGroups
            ))
          );
          break;
        case 'cursor-rules':
          actions.push(
            ...(await planCursorRulesSync(
              templateRoot,
              destinationRoot,
              layerName,
              stackReport,
              overwrite
            ))
          );
          break;
        case 'file': {
          const planned = await planFileSync(
            templateRoot,
            destinationRoot,
            layerName,
            spec.src,
            overwrite,
            config.globalNeverCopy
          );
          if (planned) {
            actions.push(planned);
          }
          break;
        }
        case 'directory':
          actions.push(
            ...(await planDirectorySync(
              templateRoot,
              destinationRoot,
              layerName,
              spec.src,
              overwrite,
              config.globalNeverCopy
            ))
          );
          break;
        default:
          warnings.push(`Unsupported path kind for ${spec.src}`);
      }
    }
  }

  const copied = actions.filter(item => item.action === 'copy' || item.action === 'update');
  const skipped = actions.filter(item => item.action === 'skip');

  return {
    layer: layers,
    dryRun,
    actions,
    copied: copied.map(item => item.relativePath),
    skipped: skipped.map(item => `${item.relativePath} (${item.reason})`),
    warnings,
    recommendations,
  };
}

async function applyAgentContextWithIntegration(
  projectRoot: string,
  templateRoot: string,
  stackReport: StackReport
): Promise<{ copied: string[]; recommendations: string[] }> {
  const integration = await integrateCursorRules({
    projectRoot,
    templateRulesPath: path.join(templateRoot, '.cursor', 'rules'),
    templateSkillsPath: path.join(templateRoot, '.agents', 'skills'),
    stackReport,
    dryRun: false,
  });

  const extraCopied: string[] = [];

  for (const relativePath of ['.cursorignore', '.cursor/rules/README.md']) {
    const source = path.join(templateRoot, relativePath);
    const destination = path.join(projectRoot, relativePath);
    if ((await exists(source)) && !(await exists(destination))) {
      await copyFile(source, destination);
      extraCopied.push(relativePath);
    }
  }

  return {
    copied: [...integration.copied, ...extraCopied],
    recommendations: integration.recommendations,
  };
}

export async function syncFromTemplate(options: SyncOptions): Promise<SyncResult> {
  const plan = await planLayerSync(options);

  if (options.dryRun !== false) {
    return plan;
  }

  const stackReport = options.stackReport ?? DEFAULT_STACK_REPORT;
  const config = await loadSyncConfig(
    resolveSyncConfigPath(options.templateRoot, options.configPath)
  );

  if (options.layers.includes('agent-context')) {
    const applied = await applyAgentContextWithIntegration(
      options.projectRoot,
      options.templateRoot,
      stackReport
    );
    plan.recommendations.push(...applied.recommendations);
  }

  const doctorLayer = config.layers.doctor;
  const devenvDir = path.join(options.projectRoot, '.devenv');
  const preserveFiles = doctorLayer?.preserveInDevenv ?? DEVENV_PRESERVE_FILES;
  const backupDir =
    options.layers.includes('doctor') && (await exists(devenvDir))
      ? await fs.mkdtemp(path.join(path.dirname(devenvDir), '.devenv-sync-backup-'))
      : null;

  if (backupDir) {
    for (const file of preserveFiles) {
      const source = path.join(devenvDir, file);
      if (await exists(source)) {
        const backup = path.join(backupDir, file);
        await fs.mkdir(path.dirname(backup), { recursive: true });
        await fs.copyFile(source, backup);
      }
    }
  }

  for (const action of plan.actions) {
    if (action.action === 'skip') {
      continue;
    }

    if (action.layer === 'agent-context') {
      continue;
    }

    const destinationRoot =
      action.layer === 'doctor' ? devenvDir : options.projectRoot;

    await applyAction(options.templateRoot, destinationRoot, action);
  }

  if (backupDir) {
    for (const file of preserveFiles) {
      const backup = path.join(backupDir, file);
      if (await exists(backup)) {
        await copyFile(backup, path.join(devenvDir, file));
      }
    }
    await fs.rm(backupDir, { recursive: true, force: true });
  }

  logger.info('Layer sync complete', {
    layers: options.layers,
    copied: plan.copied.length,
    skipped: plan.skipped.length,
  });

  return { ...plan, dryRun: false };
}

export interface DevenvMergeOptions {
  templateRoot: string;
  devenvDir: string;
  dryRun?: boolean;
}

export interface DevenvMergeResult {
  dryRun: boolean;
  branch: string;
  preserved: string[];
  message: string;
}

function runGit(cwd: string, args: string[]): { ok: boolean; stdout: string; stderr: string } {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

export async function mergeDevenvFromTemplate(
  options: DevenvMergeOptions
): Promise<DevenvMergeResult> {
  const { templateRoot, devenvDir, dryRun = true } = options;

  if (!(await exists(devenvDir))) {
    throw new Error(`.devenv directory not found: ${devenvDir}`);
  }

  if (!(await exists(path.join(devenvDir, '.git')))) {
    throw new Error('.devenv is not a git repository');
  }

  const branchResult = runGit(templateRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branchResult.ok) {
    throw new Error(`Could not read template branch: ${branchResult.stderr}`);
  }
  const templateBranch = branchResult.stdout.trim();

  const preserved: string[] = [];
  for (const file of DEVENV_PRESERVE_FILES) {
    if (await exists(path.join(devenvDir, file))) {
      preserved.push(file);
    }
  }

  if (dryRun) {
    return {
      dryRun: true,
      branch: templateBranch,
      preserved,
      message: `Would merge template/${templateBranch} into .devenv and restore ${preserved.length} project-specific file(s). Re-run with --apply to execute.`,
    };
  }

  const backupDir = await fs.mkdtemp(path.join(path.dirname(devenvDir), '.devenv-sync-backup-'));
  for (const file of preserved) {
    const source = path.join(devenvDir, file);
    const backup = path.join(backupDir, file);
    await fs.mkdir(path.dirname(backup), { recursive: true });
    await fs.copyFile(source, backup);
  }

  const status = runGit(devenvDir, ['status', '--porcelain']);
  if (status.stdout.trim()) {
    runGit(devenvDir, ['stash', 'push', '-u', '-m', `Sync backup ${new Date().toISOString()}`]);
  }

  const remotes = runGit(devenvDir, ['remote']);
  if (!remotes.stdout.split('\n').includes('template')) {
    runGit(devenvDir, ['remote', 'add', 'template', templateRoot]);
  }
  runGit(devenvDir, ['remote', 'set-url', 'template', templateRoot]);

  const fetch = runGit(devenvDir, ['fetch', 'template', templateBranch]);
  if (!fetch.ok) {
    throw new Error(`git fetch failed: ${fetch.stderr}`);
  }

  const merge = runGit(devenvDir, ['merge', `template/${templateBranch}`, '--no-edit']);
  if (!merge.ok) {
    throw new Error(`Merge conflicts detected. Restore from ${backupDir} after resolving.`);
  }

  for (const file of preserved) {
    const backup = path.join(backupDir, file);
    if (await exists(backup)) {
      await copyFile(backup, path.join(devenvDir, file));
    }
  }

  await fs.rm(backupDir, { recursive: true, force: true });

  return {
    dryRun: false,
    branch: templateBranch,
    preserved,
    message: `Merged template/${templateBranch} into .devenv.`,
  };
}
