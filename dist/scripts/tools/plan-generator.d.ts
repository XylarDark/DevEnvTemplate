#!/usr/bin/env node
/*** Plan Generator - CI-only utility
 *
 * Generates a hardening plan from gap analysis results.
 * Creates actionable tasks with code snippets, dependency ordering, and priority scoring.
 */
import { PlanGeneratorOptions } from '../types/plan';
export declare class PlanGenerator {
    private rootDir;
    private gaps;
    private tasks;
    private logger;
    private includeCodeSnippets;
    private includeDependencies;
    private sortByPriority;
    constructor(options?: PlanGeneratorOptions);
    generate(): Promise<string>;
    private gapToTask;
    private generateTaskId;
    private estimateEffort;
    private calculatePriorityScores;
    private calculateDependencies;
    private addCodeSnippets;
    private generateCodeSnippetsForTask;
    private generatePlanMarkdown;
    private generateMetadata;
    private groupTasksByPriority;
    private identifyQuickWins;
    private generateTaskGroupMarkdown;
    private generateTaskMarkdown;
    private formatPriority;
    private generateImplementationGuidelines;
    private generateSuccessMetrics;
    private generateResources;
    saveReport(planContent: string, filename?: string): Promise<void>;
}
export default PlanGenerator;
//# sourceMappingURL=plan-generator.d.ts.map