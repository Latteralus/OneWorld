import { randomUUID } from "node:crypto";

export interface JobContext {
  runId: string;
  jobName: string;
  startedAt: Date;
}

export interface WorkerJob {
  name: string;
  intervalMs: number;
  /** Must be safe to run more than once (spec section 25.2). */
  run(ctx: JobContext): Promise<void>;
}

export interface StructuredLogger {
  info(event: Record<string, unknown>): void;
  error(event: Record<string, unknown>): void;
}

/** Default logger: structured JSON to stderr, matching spec section 29.1's field list. */
export const consoleLogger: StructuredLogger = {
  info: (event) => console.error(JSON.stringify({ level: "info", ...event })),
  error: (event) => console.error(JSON.stringify({ level: "error", ...event })),
};

/**
 * Minimal recurring-job scheduler (spec section 25). Each job runs on its
 * own interval; failures are logged and swallowed so one job's error never
 * stops the others. Distributed locking/claims for multi-instance
 * deployments (25.2) is a Phase 2+ addition - documented as a gap in
 * IMPLEMENTATION_STATUS.md, not implemented here yet.
 */
export class Scheduler {
  private readonly timers: NodeJS.Timeout[] = [];

  constructor(
    private readonly jobs: WorkerJob[],
    private readonly logger: StructuredLogger = consoleLogger,
  ) {}

  start(): void {
    for (const job of this.jobs) {
      const timer = setInterval(() => {
        void this.runOnce(job);
      }, job.intervalMs);
      this.timers.push(timer);
    }
  }

  stop(): void {
    for (const timer of this.timers) clearInterval(timer);
    this.timers.length = 0;
  }

  async runOnce(job: WorkerJob): Promise<void> {
    const ctx: JobContext = { runId: randomUUID(), jobName: job.name, startedAt: new Date() };
    const startedAtMs = Date.now();
    try {
      await job.run(ctx);
      this.logger.info({
        event: "job_completed",
        job: job.name,
        runId: ctx.runId,
        durationMs: Date.now() - startedAtMs,
      });
    } catch (error) {
      this.logger.error({
        event: "job_failed",
        job: job.name,
        runId: ctx.runId,
        durationMs: Date.now() - startedAtMs,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
