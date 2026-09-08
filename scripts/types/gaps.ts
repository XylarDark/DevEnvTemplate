/**
 * Type definitions for gap analysis
 */

export interface Technology {
  name: string;
  version?: string;
  [key: string]: any;
}

export interface Configuration {
  type: string;
  configFile?: string;
  strict?: boolean;
  [key: string]: any;
}

export interface EnvTemplateInfo {
  present: boolean;
  files: string[];
}

export interface EnvLoaderInfo {
  present: boolean;
  tools: string[];
}

export interface DependencyAuditInfo {
  present: boolean;
  tools: string[];
}

export interface SecretsMetadata {
  envTemplate?: EnvTemplateInfo;
  envIgnored?: boolean;
  envLoader?: EnvLoaderInfo;
  dependencyAudit?: DependencyAuditInfo;
  [key: string]: any;
}

export interface ToolingFramework {
  name: string;
  config?: string;
}

export interface StackToolingCategory {
  present: boolean;
  frameworks?: ToolingFramework[];
  configs?: string[];
}

export interface StackTooling {
  testing: StackToolingCategory;
  linting: StackToolingCategory;
  formatting: StackToolingCategory;
  [key: string]: any;
}

export interface StackScriptsInfo {
  detected: Array<{ name: string; command: string }>;
  missing: string[];
}

export interface StackFilesInfo {
  configs: string[];
  key_patterns: string[];
}

export interface StackFrameworkInfo {
  type: string;
  version: string | null;
  dirs: string[];
}

export interface StackQuality {
  linting: boolean;
  testing: boolean;
  typescript: boolean;
  security: boolean;
  formatting: boolean;
  [key: string]: any;
}

export interface StackCIInfo {
  present: boolean;
  type?: string;
  [key: string]: any;
}

export interface CursorRulesInfo {
  present: boolean;
  existingFiles: string[];
  /** Glob-scoped rules this template ships, which load only on matching files. */
  stackFiles: string[];
  /** Rules the host wrote itself. Never overwritten. */
  projectSpecificFiles: string[];
  /**
   * Always-applied rules this template used to ship, before that content moved to `AGENTS.md`
   * and `.agents/skills/`. A host still carrying these pays their token cost on every turn.
   */
  retiredAlwaysOnFiles: string[];
  needsIntegration: boolean;
}

export interface StackReport {
  technologies: Technology[];
  configurations: Configuration[];
  tooling: StackTooling;
  scripts: StackScriptsInfo;
  files: StackFilesInfo;
  frameworks: StackFrameworkInfo;
  secrets?: SecretsMetadata;
  quality: StackQuality;
  ci: StackCIInfo;
  profiles?: string[];
  primaryProfile?: string | null;
  languageProfile?: string;
  manifest?: Record<string, unknown> | null;
  cursorRules?: CursorRulesInfo;
  /** True when a `*.uproject` exists at the repository root (Unreal Engine layout). */
  unrealProjectDetected?: boolean;
  /** True when `ProjectSettings/ProjectVersion.txt` exists at repo root or one directory down (Unity layout). */
  unityProjectDetected?: boolean;
  /** Short hints for humans/integrations (e.g. enable Unreal Cursor rules). */
  stackHints?: string[];
  [key: string]: any;
}

export type GapSeverity = 'high' | 'medium' | 'low';
export type GapCategory =
  | 'typescript'
  | 'linting'
  | 'testing'
  | 'security'
  | 'ci'
  | 'architecture'
  | 'quality'
  | 'observability'
  | 'documentation'
  | 'dependencies'
  | 'performance'
  | 'accessibility'
  | 'docker'
  | 'environment'
  | 'git-hooks'
  | 'git';

export interface Gap {
  category: GapCategory;
  severity: GapSeverity;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  effort: 'low' | 'medium' | 'high';
  files: string[];
  codeSnippet?: string;
  resources?: string[];
}

export interface GapReport {
  timestamp: string;
  totalGaps: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  gaps: Gap[];
  categories: Record<GapCategory, Gap[]>;
}

export interface GapAnalysisOptions {
  rootDir?: string;
  stackReportPath?: string;
  includeCodeSnippets?: boolean;
  mode?: 'fast' | 'full';
  debug?: boolean;
}
