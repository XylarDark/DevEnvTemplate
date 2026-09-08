export type ProgressVerbosity = 'silent' | 'simple' | 'detailed';
export interface ProgressOptions {
    total: number;
    label?: string;
    showETA?: boolean;
    showPercentage?: boolean;
    width?: number;
    stream?: NodeJS.WriteStream;
}
export interface ProgressSnapshot {
    id: string;
    current: number;
    total: number;
    percentage: number;
    eta: string | null;
    label: string;
}
/**
 * Progress bar with live updates using ANSI escape codes
 */
export declare class ProgressBar {
    private current;
    private readonly total;
    private readonly label;
    private readonly showETA;
    private readonly showPercentage;
    private readonly width;
    private readonly stream;
    private readonly startTime;
    private lastUpdate;
    private finished;
    constructor(options: ProgressOptions);
    /**
     * Update progress to specific value
     */
    update(current: number): void;
    /**
     * Increment progress by delta
     */
    increment(delta?: number): void;
    /**
     * Mark progress as complete
     */
    finish(): void;
    /**
     * Render progress bar with ANSI escape codes
     */
    private render;
    /**
     * Calculate estimated time to completion
     */
    private calculateETA;
    /**
     * Get current progress snapshot
     */
    getSnapshot(): Omit<ProgressSnapshot, 'id'>;
}
/**
 * Manages multiple progress bars with different verbosity levels
 */
export declare class ProgressTracker {
    private bars;
    private readonly verbosity;
    private readonly jsonOutput;
    constructor(verbosity?: ProgressVerbosity, jsonOutput?: boolean);
    /**
     * Create a new progress bar
     */
    createBar(id: string, options: ProgressOptions): ProgressBar | null;
    /**
     * Update a progress bar
     */
    updateBar(id: string, current: number): void;
    /**
     * Increment a progress bar
     */
    incrementBar(id: string, delta?: number): void;
    /**
     * Finish a progress bar
     */
    finishBar(id: string): void;
    /**
     * Get all progress snapshots
     */
    getProgress(): ProgressSnapshot[];
    /**
     * Emit JSON progress event
     */
    private emitJSON;
}
//# sourceMappingURL=progress.d.ts.map