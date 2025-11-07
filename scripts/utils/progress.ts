// scripts/utils/progress.ts

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
export class ProgressBar {
  private current: number = 0;
  private readonly total: number;
  private readonly label: string;
  private readonly showETA: boolean;
  private readonly showPercentage: boolean;
  private readonly width: number;
  private readonly stream: NodeJS.WriteStream;
  private readonly startTime: number;
  private lastUpdate: number = 0;
  private finished: boolean = false;

  constructor(options: ProgressOptions) {
    this.total = options.total;
    this.label = options.label || 'Progress';
    this.showETA = options.showETA !== false;
    this.showPercentage = options.showPercentage !== false;
    this.width = options.width || 20;
    this.stream = options.stream || process.stderr;
    this.startTime = Date.now();
  }

  /**
   * Update progress to specific value
   */
  update(current: number): void {
    if (this.finished) return;
    
    this.current = Math.min(current, this.total);
    const now = Date.now();
    
    // Throttle updates to every 100ms
    if (now - this.lastUpdate < 100 && this.current < this.total) {
      return;
    }
    
    this.lastUpdate = now;
    this.render();
  }

  /**
   * Increment progress by delta
   */
  increment(delta: number = 1): void {
    this.update(this.current + delta);
  }

  /**
   * Mark progress as complete
   */
  finish(): void {
    if (this.finished) return;
    
    this.current = this.total;
    this.finished = true;
    this.render();
    this.stream.write('\n');
  }

  /**
   * Render progress bar with ANSI escape codes
   */
  private render(): void {
    const percentage = this.total > 0 ? (this.current / this.total) * 100 : 0;
    const filled = Math.floor((this.width * this.current) / this.total);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    let line = `\r${this.label}: [${bar}]`;
    
    if (this.showPercentage) {
      line += ` ${Math.floor(percentage)}%`;
    }
    
    line += ` | ${this.current}/${this.total}`;
    
    if (this.showETA && this.current > 0 && this.current < this.total) {
      const eta = this.calculateETA();
      line += ` | ETA: ${eta}`;
    }
    
    this.stream.write(line);
  }

  /**
   * Calculate estimated time to completion
   */
  private calculateETA(): string {
    const elapsed = Date.now() - this.startTime;
    const rate = this.current / elapsed;
    const remaining = this.total - this.current;
    const etaMs = remaining / rate;
    
    const seconds = Math.ceil(etaMs / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${seconds % 60}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Get current progress snapshot
   */
  getSnapshot(): Omit<ProgressSnapshot, 'id'> {
    return {
      current: this.current,
      total: this.total,
      percentage: this.total > 0 ? (this.current / this.total) * 100 : 0,
      eta: this.current > 0 && this.current < this.total ? this.calculateETA() : null,
      label: this.label,
    };
  }
}

/**
 * Manages multiple progress bars with different verbosity levels
 */
export class ProgressTracker {
  private bars: Map<string, ProgressBar> = new Map();
  private readonly verbosity: ProgressVerbosity;
  private readonly jsonOutput: boolean;

  constructor(verbosity: ProgressVerbosity = 'simple', jsonOutput: boolean = false) {
    this.verbosity = verbosity;
    this.jsonOutput = jsonOutput;
  }

  /**
   * Create a new progress bar
   */
  createBar(id: string, options: ProgressOptions): ProgressBar | null {
    if (this.verbosity === 'silent') {
      return null;
    }
    
    // In simple mode, only allow 'overall' bar
    if (this.verbosity === 'simple' && id !== 'overall') {
      return null;
    }
    
    const bar = new ProgressBar(options);
    this.bars.set(id, bar);
    
    if (this.jsonOutput) {
      this.emitJSON('create', id, bar.getSnapshot());
    }
    
    return bar;
  }

  /**
   * Update a progress bar
   */
  updateBar(id: string, current: number): void {
    const bar = this.bars.get(id);
    if (bar) {
      bar.update(current);
      
      if (this.jsonOutput) {
        this.emitJSON('update', id, bar.getSnapshot());
      }
    }
  }

  /**
   * Increment a progress bar
   */
  incrementBar(id: string, delta: number = 1): void {
    const bar = this.bars.get(id);
    if (bar) {
      bar.increment(delta);
      
      if (this.jsonOutput) {
        this.emitJSON('update', id, bar.getSnapshot());
      }
    }
  }

  /**
   * Finish a progress bar
   */
  finishBar(id: string): void {
    const bar = this.bars.get(id);
    if (bar) {
      bar.finish();
      
      if (this.jsonOutput) {
        this.emitJSON('finish', id, bar.getSnapshot());
      }
      
      this.bars.delete(id);
    }
  }

  /**
   * Get all progress snapshots
   */
  getProgress(): ProgressSnapshot[] {
    const snapshots: ProgressSnapshot[] = [];
    
    for (const [id, bar] of this.bars.entries()) {
      snapshots.push({
        id,
        ...bar.getSnapshot(),
      });
    }
    
    return snapshots;
  }

  /**
   * Emit JSON progress event
   */
  private emitJSON(event: string, id: string, snapshot: Omit<ProgressSnapshot, 'id'>): void {
    const data = {
      type: 'progress',
      event,
      id,
      ...snapshot,
      timestamp: new Date().toISOString(),
    };
    
    console.log(JSON.stringify(data));
  }
}

