import type { FlightHourCategory, PilotHourTotals } from "./qualification.types.js";

/**
 * Builds one idempotency key per hour-category entry for a completed
 * flight (spec section 17.1, 7.3) so re-running the settlement worker
 * cannot double-award hours.
 */
export function buildFlightHourIdempotencyKey(
  flightSessionId: string,
  category: FlightHourCategory,
): string {
  return `flight:${flightSessionId}:hours:${category}`;
}

/** Applies a set of category -> minutes increments to a totals record (pure, no I/O). */
export function applyHourIncrements(
  totals: PilotHourTotals,
  increments: Partial<Record<FlightHourCategory, number>>,
): PilotHourTotals {
  const next = { ...totals };
  for (const [category, minutes] of Object.entries(increments) as Array<
    [FlightHourCategory, number]
  >) {
    next[category] = next[category] + minutes;
  }
  return next;
}
