import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Periodic reconciliation sweep (spec section 25.3): cached balances vs.
 * ledger, passenger pool totals, overdue active travel, expired
 * reservations, orphaned aircraft locks, incomplete flight settlements,
 * training ready-but-unprocessed, and recurring-charge gaps.
 * TODO(Phase 8): implement each check against its owning domain and alert
 * per spec section 29.3 on any discrepancy found.
 */
export const reconciliationJob: WorkerJob = {
  name: "reconciliation-sweep",
  intervalMs: 15 * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 8 (Preview Hardening) lands.
  },
};
