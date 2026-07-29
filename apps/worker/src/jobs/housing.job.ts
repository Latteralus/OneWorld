import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Charges weekly rent for active tenancies (spec section 9, 25.1).
 * TODO(Phase 2): call `@oneworld/domain-housing`'s rent sweep, posting
 * through `@oneworld/domain-finance`'s `LedgerService` with a
 * `buildIdempotencyKey.housingRent(...)` key.
 */
export const weeklyRentJob: WorkerJob = {
  name: "weekly-rent",
  intervalMs: 60 * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 2 (Employment and Recurring Economy) lands.
  },
};
