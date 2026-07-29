import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Completes ground travel whose `arrives_at` has passed and reconciles any
 * travel stuck in `TRAVELING` past a sane bound (spec section 25.1, 25.3).
 * TODO(Phase 3): call `@oneworld/domain-travel`'s `TravelService.completeOverdue()`
 * once that service exists.
 */
export const groundTravelCompletionJob: WorkerJob = {
  name: "ground-travel-completion",
  intervalMs: 30_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 3 (Ground Travel) lands.
  },
};
