/**
 * Layer-by-layer adoption for host projects.
 *
 * Layers are independent — each can be taken without the others, matching README.md#adopt-it-in-layers.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StackReport } from '../types/gaps';
import { integrateCursorRules } from '../tools/cursor-rules-integration';
import { writeAgentsStub } from './agents-stub';

export type AdoptionLayer = 'agent-context' | 'operational-memory' | 'doctor';

export const ALL_LAYERS: AdoptionLayer[] = ['agent-context', 'operational-memory', 'doctor'];

export interface LayerAdoptionOptions {
  projectRoot: string;
  templateRoot: string;
  layers: AdoptionLayer[];
  stackReport: StackReport;
  declinedLayers?: AdoptionLayer[];
  dryRun?: boolean;
}

export interface LayerAdoptionResult {
  layer: AdoptionLayer;
  copied: string[];
  skipped: string[];
  recommendations: string[];
}

export interface AdoptionSummary {
  results: LayerAdoptionResult[];
  agentsMd?: { written: boolean; path: string; skippedReason?: string };
}

const OPERATIONAL_FILES = [
  { stub: 'KNOWN_ERRORS.stub.md', dest: 'docs/KNOWN_ERRORS.md' },
  { stub: 'DOCS_LAYOUT.stub.md', dest: 'docs/DOCS_LAYOUT.md' },
  { stub: 'automation-gaps.stub.md', dest: 'docs/operational/automation-gaps.md' },
] as const;

const DOCTOR_VENDOR_PATHS = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'config',
  'scripts/doctor',
  'scripts/tools',
  'scripts/utils',
  '.cursor/rules',
  '.agents/skills',
  'eslint.config.js',
  '.prettierrc',
  '.nvmrc',
] as const;

const DOCTOR_SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.devenv',
  'coverage',
  'tests',
]);

async function exists(target: string): Promise<boolean> {
  return fs
    .access(target)
    .then(() => true)
    .catch(() => false);
}

async function copyStubIfMissing(
  templateRoot: string,
  projectRoot: string,
  stubName: string,
  destRelative: string,
  dryRun: boolean
): Promise<{ copied: boolean; skipped: boolean }> {
  const source = path.join(templateRoot, 'scripts', 'agent', 'stubs', stubName);
  const destination = path.join(projectRoot, destRelative);

  if (await exists(destination)) {
    return { copied: false, skipped: true };
  }

  if (dryRun) {
    return { copied: false, skipped: false };
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
  return { copied: true, skipped: false };
}

async function adoptAgentContext(options: LayerAdoptionOptions): Promise<LayerAdoptionResult> {
  const { projectRoot, templateRoot, stackReport, dryRun = false } = options;
  const result: LayerAdoptionResult = {
    layer: 'agent-context',
    copied: [],
    skipped: [],
    recommendations: [],
  };

  if (dryRun) {
    result.recommendations.push('[DRY RUN] Would copy stack-scoped rules and skills.');
    return result;
  }

  const integration = await integrateCursorRules({
    projectRoot,
    templateRulesPath: path.join(templateRoot, '.cursor', 'rules'),
    templateSkillsPath: path.join(templateRoot, '.agents', 'skills'),
    stackReport,
    dryRun: false,
  });

  result.copied.push(...integration.copied);
  result.skipped.push(...integration.skipped);
  result.recommendations.push(...integration.recommendations);
  return result;
}

async function adoptOperationalMemory(options: LayerAdoptionOptions): Promise<LayerAdoptionResult> {
  const { projectRoot, templateRoot, dryRun = false } = options;
  const result: LayerAdoptionResult = {
    layer: 'operational-memory',
    copied: [],
    skipped: [],
    recommendations: [],
  };

  for (const { stub, dest } of OPERATIONAL_FILES) {
    const outcome = await copyStubIfMissing(templateRoot, projectRoot, stub, dest, dryRun);
    if (outcome.copied) {
      result.copied.push(dest);
    } else if (outcome.skipped) {
      result.skipped.push(dest);
    } else if (dryRun) {
      result.recommendations.push(`[DRY RUN] Would copy ${dest}`);
    }
  }

  return result;
}

async function shouldSkipDoctorPath(relativePath: string): Promise<boolean> {
  return relativePath.split(path.sep).some(part => DOCTOR_SKIP_DIR_NAMES.has(part));
}

async function copyDoctorTree(
  sourceRoot: string,
  destRoot: string,
  relativePath: string,
  dryRun: boolean,
  copied: string[]
): Promise<void> {
  if (await shouldSkipDoctorPath(relativePath)) {
    return;
  }

  const source = path.join(sourceRoot, relativePath);
  const destination = path.join(destRoot, relativePath);

  let stat;
  try {
    stat = await fs.stat(source);
  } catch {
    return;
  }

  if (stat.isDirectory()) {
    if (!dryRun) {
      await fs.mkdir(destination, { recursive: true });
    }
    const entries = await fs.readdir(source, { withFileTypes: true });
    for (const entry of entries) {
      const childRelative = path.join(relativePath, entry.name);
      if (entry.isDirectory()) {
        await copyDoctorTree(sourceRoot, destRoot, childRelative, dryRun, copied);
      } else if (entry.isFile()) {
        const childDest = path.join(destRoot, childRelative);
        if (!(await exists(childDest))) {
          if (!dryRun) {
            await fs.mkdir(path.dirname(childDest), { recursive: true });
            await fs.copyFile(path.join(source, entry.name), childDest);
          }
          copied.push(path.join('.devenv', childRelative));
        }
      }
    }
    return;
  }

  if (!(await exists(destination))) {
    if (!dryRun) {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(source, destination);
    }
    copied.push(path.join('.devenv', relativePath));
  }
}

async function wireDoctorScripts(projectRoot: string, dryRun: boolean): Promise<string[]> {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!(await exists(packageJsonPath))) {
    return ['No host package.json — add doctor scripts manually after `cd .devenv && npm install`.'];
  }

  const raw = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(raw) as { scripts?: Record<string, string> };
  packageJson.scripts ??= {};

  const doctorScripts: Record<string, string> = {
    doctor: 'node .devenv/dist/scripts/doctor/cli.js',
    'doctor:fix': 'node .devenv/dist/scripts/doctor/cli.js --fix',
  };

  const added: string[] = [];
  for (const [name, command] of Object.entries(doctorScripts)) {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = command;
      added.push(name);
    }
  }

  if (added.length > 0 && !dryRun) {
    await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
  }

  return added.length > 0
    ? [`Added npm scripts: ${added.join(', ')}.`]
    : ['Host package.json already defines doctor scripts.'];
}

async function ensureDevenvGitignore(projectRoot: string, dryRun: boolean): Promise<void> {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const entry = '.devenv/\n';
  let existing = '';

  if (await exists(gitignorePath)) {
    existing = await fs.readFile(gitignorePath, 'utf8');
    if (existing.includes('.devenv')) {
      return;
    }
  }

  if (dryRun) {
    return;
  }

  const needsLeadingNewline = existing.length > 0 && !existing.endsWith('\n');
  const addition = `${needsLeadingNewline ? '\n' : ''}# .devenv workspace (auto-added)\n${entry}`;
  await fs.writeFile(gitignorePath, existing + addition, 'utf8');
}

async function adoptDoctor(options: LayerAdoptionOptions): Promise<LayerAdoptionResult> {
  const { projectRoot, templateRoot, dryRun = false } = options;
  const devenvRoot = path.join(projectRoot, '.devenv');
  const result: LayerAdoptionResult = {
    layer: 'doctor',
    copied: [],
    skipped: [],
    recommendations: [],
  };

  if (dryRun) {
    result.recommendations.push('[DRY RUN] Would vendor doctor toolchain under .devenv/.');
    return result;
  }

  await fs.mkdir(devenvRoot, { recursive: true });

  for (const relativePath of DOCTOR_VENDOR_PATHS) {
    await copyDoctorTree(templateRoot, devenvRoot, relativePath, dryRun, result.copied);
  }

  await ensureDevenvGitignore(projectRoot, dryRun);
  result.recommendations.push(...(await wireDoctorScripts(projectRoot, dryRun)));
  result.recommendations.push(
    'Run `cd .devenv && npm install && npm run build` once to compile the doctor.'
  );

  return result;
}

export async function adoptLayers(options: LayerAdoptionOptions): Promise<AdoptionSummary> {
  const selected = new Set(options.layers);
  const declined =
    options.declinedLayers ?? ALL_LAYERS.filter(layer => !selected.has(layer));

  const results: LayerAdoptionResult[] = [];

  let agentsMd: AdoptionSummary['agentsMd'];
  if (selected.has('agent-context') && !options.dryRun) {
    agentsMd = await writeAgentsStub({
      projectRoot: options.projectRoot,
      stackReport: options.stackReport,
      declinedLayers: declined,
    });
  } else if (selected.has('agent-context') && options.dryRun) {
    agentsMd = {
      written: false,
      path: path.join(options.projectRoot, 'AGENTS.md'),
      skippedReason: 'dry run',
    };
  }

  if (selected.has('agent-context')) {
    results.push(await adoptAgentContext(options));
  }
  if (selected.has('operational-memory')) {
    results.push(await adoptOperationalMemory(options));
  }
  if (selected.has('doctor')) {
    results.push(await adoptDoctor(options));
  }

  return { results, agentsMd };
}

export function parseLayerList(raw: string | undefined): AdoptionLayer[] | null {
  if (!raw) {
    return null;
  }

  const tokens = raw.split(',').map(part => part.trim()).filter(Boolean);
  const valid = new Set(ALL_LAYERS);
  const parsed: AdoptionLayer[] = [];

  for (const token of tokens) {
    if (!valid.has(token as AdoptionLayer)) {
      throw new Error(`Unknown layer "${token}". Choose from: ${ALL_LAYERS.join(', ')}`);
    }
    parsed.push(token as AdoptionLayer);
  }

  return parsed.length > 0 ? parsed : null;
}
