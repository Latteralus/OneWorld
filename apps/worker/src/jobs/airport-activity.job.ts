import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Decays airport activity scores toward the configured floor (spec
 * section 15.3, 25.1). TODO(Phase 4): call `@oneworld/domain-airports`'s
 * `decayActivityScore` per airport, gated by
 * `feature-flags#airport_activity_decay_enabled`.
 */
export const airportActivityDecayJob: WorkerJob = {
  name: "airport-activity-decay",
  intervalMs: 60 * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 4 (Passenger Pools and Job Builder) lands.
  },
};
