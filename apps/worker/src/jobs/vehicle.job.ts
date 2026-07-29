import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Charges weekly vehicle maintenance (spec section 10.5, 25.1).
 * TODO(Phase 2): call `@oneworld/domain-vehicles`'s maintenance sweep,
 * posting through `@oneworld/domain-finance`'s `LedgerService` with a
 * `buildIdempotencyKey.vehicleMaintenance(...)` key.
 */
export const weeklyVehicleMaintenanceJob: WorkerJob = {
  name: "weekly-vehicle-maintenance",
  intervalMs: 60 * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 2 lands.
  },
};
