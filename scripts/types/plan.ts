// scripts/types/plan.ts

import { Gap } from './gaps';

export interface TaskDependency {
  taskId: string;
  reason: string;
}

export interface CodeSnippet {
  language: string;
  filename?: string;
  code: string;
  description?: string;
}

export interface Task {
  id: string;
  number: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: string;
  recommendation: string;
  category: string;
  files: string[];
  resources?: string[];
  codeSnippets?: CodeSnippet[];
  dependencies?: TaskDependency[];
  estimatedMinutes: number;
  priorityScore: number;
}

export interface TaskGroup {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  tasks: Task[];
  totalEffort: number;
  totalImpact: number;
}

export interface PlanMetadata {
  generatedAt: string;
  totalTasks: number;
  totalEstimatedHours: number;
  quickWins: number;
  criticalTasks: number;
  version: string;
}

export interface HardeningPlan {
  metadata: PlanMetadata;
  summary: {
    high: number;
    medium: number;
    low: number;
  };
  taskGroups: TaskGroup[];
  dependencyGraph: Map<string, string[]>;
}

export interface PlanGeneratorOptions {
  rootDir?: string;
  includeCodeSnippets?: boolean;
  includeDependencies?: boolean;
  sortByPriority?: boolean;
}

