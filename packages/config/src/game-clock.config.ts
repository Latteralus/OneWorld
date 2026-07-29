/**
 * OneWorld runs on a permanent 1:1 real-world time scale (spec section 5).
 * All backend timestamps are stored in UTC; this is only the *display*
 * timezone default for player-facing clocks.
 */
export const gameClockConfig = {
  /** Backend storage timezone. Never change - all timestamps are UTC. */
  storageTimezone: "UTC",
  /** Default player-facing display timezone. Handles DST automatically. */
  defaultDisplayTimezone: "America/New_York",
  /** Real minutes per game minute. Fixed at 1:1 for the preview and beyond. */
  minutesPerGameMinute: 1,
} as const;

export type GameClockConfig = typeof gameClockConfig;
