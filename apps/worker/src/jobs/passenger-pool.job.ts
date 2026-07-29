import { passengerConfig } from "@oneworld/config";
import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Generates passengers toward each airport's target and returns expired
 * reservations to the pool (spec section 13.4-13.5, 25.1).
 * TODO(Phase 4): call `@oneworld/domain-passengers`'s `PassengerService`
 * using `calculatePassengersGeneratedThisInterval` per airport.
 */
export const passengerGenerationJob: WorkerJob = {
  name: "passenger-generation",
  intervalMs: passengerConfig.generationIntervalMinutes * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 4 (Passenger Pools and Job Builder) lands.
  },
};

export const passengerReservationExpirationJob: WorkerJob = {
  name: "passenger-reservation-expiration",
  intervalMs: 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 4 lands.
  },
};
