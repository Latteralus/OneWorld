import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Releases aircraft reservation locks with no active job (spec section
 * 25.3). TODO(Phase 5): call `@oneworld/domain-aircraft`'s
 * `AircraftService.releaseExpired()`.
 */
export const aircraftReservationExpirationJob: WorkerJob = {
  name: "aircraft-reservation-expiration",
  intervalMs: 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 5 (Aircraft and Tracker Integration) lands.
  },
};
