/**
 * Type definitions for cleanup engine
 */

export interface CleanupRule {
  id: string;
  type: string;
  description?: string;
  condition?: string;
  glob?: string | string[];
  globs?: string | string[];
  exclude?: string[];
  include_globs?: string[];
  exclude_globs?: string[];
  block_markers?: {
    start: string;
    end: string;
  }[];
  line_tag?: string;
  tag?: string;
  manager?: string;
  package_prune?: {
    manager: string;
    remove_deps?: string[];
    remove_dev_deps?: string[];
  };
  remove_deps?: string[];
  remove_dev_deps?: string[];
  remove_empty_files?: boolean;
  remove_empty_dirs?: boolean;
  module?: string;
}

export interface Profile {
  extends?: string;
  rules: CleanupRule[];
}

export interface CleanupConfig {
  version?: number;
  profile?: string;
  features?: string[];
  comment_syntax: Record<string, string | [string, string]>;
  markers: Record<string, { start: string; end: string } | string>;
  profiles: Record<string, Profile>;
  conditional_rules?: Record<string, CleanupRule[]>;
}

export interface CleanupAction {
  type: string;
  rule: string;
  path?: string;
  dependency?: string;
  section?: string;
  manager?: string;
  file?: string;
  reason?: string;
  description?: string;
  blocksRemoved?: number;
  linesRemoved?: number;
  condition?: string;
  dryRun: boolean;
  [key: string]: any;
}

export interface ErrorRecord {
  rule: string;
  file?: string;
  error: string;
  stack?: string;
  details?: any;
}

export interface Summary {
  totalActions: number;
  filesDeleted: number;
  linesRemoved: number;
  blocksRemoved: number;
  dependenciesRemoved: number;
}

export interface CleanupReport {
  timestamp: string;
  profile: string;
  features: string[];
  dryRun: boolean;
  actions: CleanupAction[];
  errors: ErrorRecord[];
  summary: Summary;
}

export interface CleanupOptions {
  configPath?: string;
  profile?: string;
  features?: string[];
  workingDir?: string;
  dryRun?: boolean;
  failOnActions?: boolean;
  onlyRules?: string[];
  excludeRules?: string[];
  excludeGlobs?: string[];
  keepFiles?: string[];
  parallel?: boolean;
  concurrency?: number;
}

