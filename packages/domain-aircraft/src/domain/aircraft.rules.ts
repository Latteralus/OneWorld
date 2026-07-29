import { scaleCents, type Cents } from "@oneworld/utils";
import type { AircraftInstance } from "./aircraft.types.js";
import type { AirportId } from "@oneworld/contracts";

/**
 * Wet-rate rental cost (spec section 16.7 - the preview's single primary
 * rental model). `minutes` should come from the quote's estimated flight
 * time; actual telemetry duration settles the final charge.
 */
export function calculateWetRentalCostCents(hourlyRateCents: Cents, minutes: number): Cents {
  if (minutes < 0) throw new RangeError("minutes must not be negative");
  return scaleCents(hourlyRateCents, Math.round(minutes), 60);
}

/**
 * An aircraft may be reserved only if it is at the requested origin,
 * marked available, and not already locked by another reservation
 * (spec section 16.6). Reservation locking itself must be atomic
 * (section 27.4) - this is the pre-check, not the lock.
 */
export function isAircraftAvailableForReservation(
  aircraft: AircraftInstance,
  originAirportId: AirportId,
): boolean {
  return aircraft.rentalAvailable && aircraft.currentAirportId === originAirportId;
}
