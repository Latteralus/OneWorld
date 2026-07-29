import { passengerConfig } from "@oneworld/config";

/**
 * Passengers generated for one interval (spec section 13.4):
 * `passengers generated = base generation rate * airport activity modifier`,
 * moving the waiting count toward the (modifier-adjusted) target without
 * exceeding it.
 */
export function calculatePassengersGeneratedThisInterval(
  waitingCount: number,
  adjustedPassengerTarget: number,
  activityModifier: number,
): number {
  if (waitingCount >= adjustedPassengerTarget) return 0;
  const gap = adjustedPassengerTarget - waitingCount;
  const generated = gap * passengerConfig.baseGenerationRate * activityModifier;
  return Math.min(Math.round(generated), gap);
}

/**
 * Whether a reservation is allowed given the current pool (spec section
 * 13.5): the reservation must not drive `waitingCount` negative.
 */
export function canReservePassengers(waitingCount: number, requestedCount: number): boolean {
  return requestedCount > 0 && requestedCount <= waitingCount;
}
