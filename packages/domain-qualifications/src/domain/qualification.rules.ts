import type { FlightHourCategory, PilotHourTotals } from "./qualification.types.js";

/** Maps camelCase `FlightHourCategory` keys to the snake_case strings stored in `pilot_hour_totals.category`. */
export const pilotHourCategoryToColumnValue: Record<FlightHourCategory, string> = {
  total: "total",
  pic: "pic",
  singleEnginePiston: "single_engine_piston",
  multiEnginePiston: "multi_engine_piston",
  turboprop: "turboprop",
  jet: "jet",
  day: "day",
  night: "night",
  instrument: "instrument",
  crossCountry: "cross_country",
};

/** All `FlightHourCategory` keys, in the fixed order `initializePilotHourTotals` writes one row per category. */
export const flightHourCategories = Object.keys(
  pilotHourCategoryToColumnValue,
) as FlightHourCategory[];

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
