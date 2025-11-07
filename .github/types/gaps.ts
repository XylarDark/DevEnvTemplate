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

export interface StackReport {
  technologies: Technology[];
  configurations: Configuration[];
  quality: {
    testing: boolean;
    security: boolean;
    [key: string]: any;
  };
  ci: {
    present: boolean;
    type?: string;
    [key: string]: any;
  };
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
}

