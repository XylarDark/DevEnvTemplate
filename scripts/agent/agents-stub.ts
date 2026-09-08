/**
 * Generate a host-specific AGENTS.md stub from detected stack facts.
 *
 * Deliberately does not copy the template's own AGENTS.md — that file describes DevEnvTemplate,
 * not the host project.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StackReport } from '../types/gaps';

export interface AgentsStubOptions {
  projectRoot: string;
  stackReport: StackReport;
  /** Layers the host chose not to adopt — recorded so agents do not re-litigate them. */
  declinedLayers?: string[];
  /** Optional one-line absences the host has already decided (e.g. "no linter"). */
  acceptedAbsences?: string[];
}

export interface AgentsStubResult {
  written: boolean;
  path: string;
  skippedReason?: string;
}

const LAYER_LABELS: Record<string, string> = {
  'agent-context': 'Agent context (AGENTS.md shape, skills, glob-scoped rules)',
  'operational-memory': 'Operational memory (KNOWN_ERRORS, automation-gaps, DOCS_LAYOUT)',
  doctor: 'Doctor (Node health check under `.devenv/`)',
};

async function exists(target: string): Promise<boolean> {
  return fs
    .access(target)
    .then(() => true)
    .catch(() => false);
}

function projectName(projectRoot: string, stackReport: StackReport): string {
  const manifest = stackReport.manifest as { name?: string } | null | undefined;
  if (manifest?.name && typeof manifest.name === 'string') {
    return manifest.name;
  }
  return path.basename(projectRoot);
}

function formatStackLines(stackReport: StackReport): string[] {
  const lines: string[] = [];

  const techNames = stackReport.technologies.map(t => t.name).filter(Boolean);
  if (techNames.length > 0) {
    lines.push(`- **Languages / runtime:** ${techNames.join(', ')}`);
  }

  if (stackReport.frameworks?.type && stackReport.frameworks.type !== 'unknown') {
    const version = stackReport.frameworks.version ? ` ${stackReport.frameworks.version}` : '';
    lines.push(`- **Framework:** ${stackReport.frameworks.type}${version}`);
  }

  if (stackReport.unrealProjectDetected) {
    lines.push('- **Engine:** Unreal (`.uproject` detected)');
  }
  if (stackReport.unityProjectDetected) {
    lines.push('- **Engine:** Unity (`ProjectSettings/ProjectVersion.txt` detected)');
  }

  const testFrameworks = stackReport.tooling?.testing?.frameworks?.map(f => f.name) ?? [];
  if (testFrameworks.length > 0) {
    lines.push(`- **Testing:** ${testFrameworks.join(', ')}`);
  } else if (stackReport.quality?.testing) {
    lines.push('- **Testing:** configured (see Commands)');
  }

  if (stackReport.tooling?.linting?.present) {
    const linters = stackReport.tooling.linting.frameworks?.map(f => f.name).join(', ');
    lines.push(`- **Linting:** ${linters || 'present'}`);
  }

  if (lines.length === 0) {
    lines.push('- Stack detection found no strong signals — update this section as the project grows.');
  }

  return lines;
}

function formatCommandTable(stackReport: StackReport): string[] {
  const detected = stackReport.scripts?.detected ?? [];
  if (detected.length === 0) {
    return ['| *(none detected)* | Add your project commands here |'];
  }

  const purposeHints: Record<string, string> = {
    test: 'Run the test suite',
    lint: 'Lint the codebase',
    build: 'Compile or bundle',
    start: 'Start the dev server',
    dev: 'Start the dev server',
    format: 'Format source files',
    doctor: 'Health check (DevEnvTemplate doctor)',
    'doctor:fix': 'Health check with auto-fix',
  };

  return detected.slice(0, 8).map(script => {
    const purpose = purposeHints[script.name] ?? 'Project script';
    return `| \`${script.name}\` | ${purpose} |`;
  });
}

function formatLayoutLines(stackReport: StackReport): string[] {
  const lines: string[] = [];
  const patterns = stackReport.files?.key_patterns ?? [];
  const frameworkDirs = stackReport.frameworks?.dirs ?? [];

  for (const dir of frameworkDirs.slice(0, 4)) {
    lines.push(`- \`${dir}/\` — application source (detected)`);
  }

  for (const pattern of patterns.slice(0, 4)) {
    if (!frameworkDirs.some(d => pattern.startsWith(d))) {
      lines.push(`- \`${pattern}\` — notable path (detected)`);
    }
  }

  if (lines.length === 0) {
    lines.push('- Document your top-level directories here.');
  }

  return lines;
}

function formatDeclinedLayers(declinedLayers: string[]): string[] {
  if (declinedLayers.length === 0) {
    return [];
  }

  const items = declinedLayers.map(layer => {
    const label = LAYER_LABELS[layer] ?? layer;
    return `- **${layer}:** not adopted (${label})`;
  });

  return ['## Accepted absences', '', 'Layers or tooling deliberately skipped:', '', ...items, ''];
}

function formatAcceptedAbsences(absences: string[]): string[] {
  if (absences.length === 0) {
    return [];
  }

  return [
    ...(absences.length > 0 ? ['Decisions already made:', ''] : []),
    ...absences.map(item => `- ${item}`),
    '',
  ];
}

/**
 * Build the AGENTS.md body without writing it.
 */
export function buildAgentsStub(options: AgentsStubOptions): string {
  const { stackReport, declinedLayers = [], acceptedAbsences = [] } = options;
  const name = projectName(options.projectRoot, stackReport);

  const sections = [
    `# ${name} — agent instructions`,
    '',
    'Canonical always-loaded context for AI assistants working in this repository.',
    'Keep this file short; move procedural detail into `.agents/skills/` and file-specific guidance into glob-scoped `.cursor/rules/`.',
    '',
    '## Stack',
    '',
    ...formatStackLines(stackReport),
    '',
    '## Commands',
    '',
    'Run from the repository root.',
    '',
    '| Command | Purpose |',
    '| ------- | ------- |',
    ...formatCommandTable(stackReport),
    '',
    '## Layout',
    '',
    ...formatLayoutLines(stackReport),
    '',
    '## Conventions',
    '',
    '- Record recurring failures in `docs/KNOWN_ERRORS.md`.',
    '- Record automation limits in `docs/operational/automation-gaps.md`.',
    '- A gap you declined is not a bug — note accepted absences below or in this file.',
    '',
  ];

  const declinedSection = formatDeclinedLayers(declinedLayers);
  if (declinedSection.length > 0) {
    sections.push(...declinedSection);
  }

  const absencesSection = formatAcceptedAbsences(acceptedAbsences);
  if (absencesSection.length > 0 && declinedSection.length === 0) {
    sections.push('## Accepted absences', '', ...absencesSection);
  } else if (absencesSection.length > 0) {
    sections.push(...absencesSection);
  }

  return sections.join('\n').trimEnd() + '\n';
}

/**
 * Write AGENTS.md when the host does not already have one.
 */
export async function writeAgentsStub(options: AgentsStubOptions): Promise<AgentsStubResult> {
  const target = path.join(options.projectRoot, 'AGENTS.md');

  if (await exists(target)) {
    return {
      written: false,
      path: target,
      skippedReason: 'AGENTS.md already exists',
    };
  }

  const content = buildAgentsStub(options);
  await fs.writeFile(target, content, 'utf8');

  return { written: true, path: target };
}

/**
 * Returns true when content looks like the template's own AGENTS.md rather than a host stub.
 */
export function looksLikeTemplateAgents(content: string): boolean {
  const markers = [
    'DevEnvTemplate is the **doctor**',
    'scripts/doctor/',
    'npm run doctor:fix',
    'Adopt it in layers',
  ];
  return markers.some(marker => content.includes(marker));
}
