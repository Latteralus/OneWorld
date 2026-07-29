/**
 * Passenger pool generation (spec section 13). Passengers are aggregate
 * counts in the preview, not named NPCs.
 */
export const passengerConfig = {
  /** Base fraction of the (modifier-adjusted) gap to waiting target closed per interval. */
  baseGenerationRate: 0.1,
  generationIntervalMinutes: 15,
  /** Reservations must be started before this timeout or passengers return to the pool (13.5). */
  reservationExpirationMinutes: 20,
} as const;

export type PassengerConfig = typeof passengerConfig;
