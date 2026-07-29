/**
 * Passenger flight job pricing (spec section 14.3).
 */
export const jobConfig = {
  ratePerPassengerNmCents: 125, // $1.25 per passenger per nautical mile
  minimumFarePerPassengerCents: 7_500, // $75
  /** Player must begin the flight before this timeout or the job expires (14.5). */
  reservationExpirationMinutes: 20,
} as const;

export type JobConfig = typeof jobConfig;
