import { describe, expect, it, vi } from "vitest";
import { Scheduler, type StructuredLogger, type WorkerJob } from "../scheduler.js";

function makeSilentLogger(): StructuredLogger {
  return { info: vi.fn(), error: vi.fn() };
}

describe("Scheduler.runOnce", () => {
  it("logs completion with a run ID and duration on success", async () => {
    const logger = makeSilentLogger();
    const job: WorkerJob = {
      name: "test-job",
      intervalMs: 1000,
      run: vi.fn().mockResolvedValue(undefined),
    };
    const scheduler = new Scheduler([job], logger);

    await scheduler.runOnce(job);

    expect(job.run).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ event: "job_completed", job: "test-job" }),
    );
  });

  it("catches a failing job and logs it instead of throwing (spec section 25.2)", async () => {
    const logger = makeSilentLogger();
    const job: WorkerJob = {
      name: "flaky-job",
      intervalMs: 1000,
      run: vi.fn().mockRejectedValue(new Error("boom")),
    };
    const scheduler = new Scheduler([job], logger);

    await expect(scheduler.runOnce(job)).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ event: "job_failed", job: "flaky-job", error: "boom" }),
    );
  });

  it("gives every run a distinct run ID", async () => {
    const logger = makeSilentLogger();
    const job: WorkerJob = {
      name: "test-job",
      intervalMs: 1000,
      run: vi.fn().mockResolvedValue(undefined),
    };
    const scheduler = new Scheduler([job], logger);

    await scheduler.runOnce(job);
    await scheduler.runOnce(job);

    const runIds = (logger.info as ReturnType<typeof vi.fn>).mock.calls.map(
      (call) => call[0].runId,
    );
    expect(runIds[0]).not.toBe(runIds[1]);
  });
});
