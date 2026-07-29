import {
  airportConfig,
  type AirportActivityClass,
  type AirportPhysicalTier,
} from "@oneworld/config";

/**
 * Adjusted passenger target for an airport (spec sections 12.3, 15.4):
 * base target for the physical tier, scaled by the current activity
 * class. This is the shared airport/passenger contract referenced in
 * section 21.4 (`calculateAirportPassengerTarget`).
 */
export function calculateAirportPassengerTarget(
  physicalTier: AirportPhysicalTier,
  activityClass: AirportActivityClass,
): number {
  const base = airportConfig.basePassengerTargetByTier[physicalTier];
  const modifier = airportConfig.passengerTargetModifierByActivity[activityClass];
  return Math.round(base * modifier);
}

/**
 * Bounded activity decay toward the floor (spec section 15.3) - never
 * negative, never touches the physical tier or historical totals.
 */
export function decayActivityScore(currentScore: number, hoursElapsed: number): number {
  if (hoursElapsed < 0) throw new RangeError("hoursElapsed must not be negative");
  const decayed = currentScore - airportConfig.activityDecayPointsPerHour * hoursElapsed;
  return Math.max(airportConfig.activityDecayFloor, decayed);
}

/**
 * Simple event-based activity points (spec section 15.2): one point per
 * departing passenger, one per arriving passenger, one completion bonus.
 */
export function calculateActivityPointsForCompletedFlight(passengerCount: number): {
  departurePoints: number;
  arrivalPoints: number;
  completionBonus: number;
  total: number;
} {
  const departurePoints = passengerCount;
  const arrivalPoints = passengerCount;
  const completionBonus = 1;
  return {
    departurePoints,
    arrivalPoints,
    completionBonus,
    total: departurePoints + arrivalPoints + completionBonus,
  };
}
