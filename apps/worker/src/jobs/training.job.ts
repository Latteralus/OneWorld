import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Advances training enrollments whose timer has completed to
 * `READY_FOR_CHECK_FLIGHT` (spec section 17.4, 25.1). TODO(Phase 7): call
 * `@oneworld/domain-training`'s enrollment-completion sweep.
 */
export const trainingTimerCompletionJob: WorkerJob = {
  name: "training-timer-completion",
  intervalMs: 5 * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 7 (Training and Early Progression) lands.
  },
};
