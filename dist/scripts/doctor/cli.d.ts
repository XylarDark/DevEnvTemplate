#!/usr/bin/env node
/**
 * Development Environment Doctor Mode
 *
 * Acts as a "doctor" for your development environment:
 * - Diagnoses issues (stack-detector)
 * - Prescribes solutions (gap-analyzer)
 * - Generates treatment plan (plan-generator)
 * - Shows health score
 */
import type { Gap, GapReport, GapSeverity } from '../types/gaps';
/** Scored dimensions. `overall` is the weighted roll-up of the rest. */
interface HealthScore {
    overall: number;
    security: number;
    quality: number;
    testing: number;
    ci: number;
    typeSafety: number;
    /** Quality of the instructions, rules, and skills that AI agents read. */
    agentContext: number;
    documentation: number;
}
type ScoredDimension = Exclude<keyof HealthScore, 'overall'>;
interface Issue {
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    estimatedFix: string;
    /** Dimension this issue was scored against, so a report can be audited. */
    dimension?: ScoredDimension;
}
interface DoctorReport {
    timestamp: string;
    healthScore: HealthScore;
    critical: Issue[];
    warnings: Issue[];
    info: Issue[];
    quickWins: Issue[];
    /**
     * Gap categories with no entry in the scoring config. Surfaced rather than dropped so a new
     * analyzer category cannot silently stop affecting the score.
     */
    unscoredCategories: string[];
    /**
     * Controls the doctor cannot inspect. Carried in the report itself so consumers of the JSON
     * see the same caveat as readers of the console output.
     */
    notVerifiedFromRepositoryContents: string[];
}
/** Scoring configuration, loaded from config/quality-budgets.json. */
interface HealthScoreConfig {
    penalties: Record<GapSeverity, number>;
    weights: Partial<Record<ScoredDimension, number>>;
    categoryMap: Record<string, ScoredDimension>;
}
/**
 * Fallback scoring configuration.
 *
 * Kept in sync with the `healthScore` block of config/quality-budgets.json and used when the
 * doctor runs against a project that has no config of its own.
 */
declare const DEFAULT_HEALTH_SCORE_CONFIG: HealthScoreConfig;
interface CliOptions {
    fix?: boolean;
    noInstall?: boolean;
    preset?: 'nextjs' | 'vite' | 'express' | 'vanilla';
    dryRun?: boolean;
    strict?: boolean;
    json?: boolean;
    projectRoot?: string;
    mode?: 'fast' | 'full';
    debug?: boolean;
    integrateCursorRules?: boolean;
    offline?: boolean;
}
/**
 * Main doctor command
 */
declare function runDoctor(options?: CliOptions): Promise<void>;
/**
 * Load scoring configuration, falling back to the built-in defaults.
 *
 * A project may override weights and penalties in config/quality-budgets.json. A malformed or
 * absent config must not fail the run, but a malformed one is reported so it is not silently
 * ignored.
 */
declare function loadHealthScoreConfig(workingDir: string): Promise<HealthScoreConfig>;
/**
 * Convert the analyzer's structured report into a doctor report.
 *
 * Consumes `.devenv/gaps-report.json` rather than re-parsing the human markdown. The markdown
 * groups gaps by category and encodes severity only as an emoji inside a heading, so parsing it
 * cannot recover severity reliably.
 */
declare function buildDoctorReport(gapReport: GapReport, config: HealthScoreConfig): DoctorReport;
/**
 * Calculate per-dimension and overall health scores.
 *
 * Each dimension starts at 100 and loses the configured penalty for every gap routed to it by
 * `categoryMap`. `overall` is the weighted mean of the weighted dimensions; dimensions without a
 * weight (documentation, by default) are reported but do not move `overall`.
 *
 * Routing is driven by the analyzer's own `category` field. The previous implementation matched
 * keywords against the category *and* the message, so a single gap could be penalized in several
 * dimensions at once.
 */
declare function calculateHealthScore(gaps: Gap[], config: HealthScoreConfig): HealthScore;
export { buildDoctorReport, calculateHealthScore, loadHealthScoreConfig, runDoctor, DEFAULT_HEALTH_SCORE_CONFIG, };
export type { DoctorReport, HealthScore, HealthScoreConfig, Issue, ScoredDimension };
//# sourceMappingURL=cli.d.ts.map