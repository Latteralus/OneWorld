/**
 * Training-workflow timing shared across enrollments (spec section 17.4).
 * Per-qualification tuition/duration lives in qualification.config.ts;
 * this file holds cross-cutting training-service behavior.
 */
export const trainingConfig = {
  /** Training timers run in real time whether or not the player is online (17.4). */
  runsWhileOffline: true,
  /** How long a ready-for-check-flight enrollment stays valid before requiring re-confirmation. */
  checkFlightWindowHours: 168, // 7 days
} as const;

export type TrainingConfig = typeof trainingConfig;
