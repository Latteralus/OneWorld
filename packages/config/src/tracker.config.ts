/**
 * Tracker / flight-telemetry validation tolerances (spec sections 18, 30.4).
 * These are anti-cheat/validation thresholds, so they live in code
 * configuration rather than live-editable database config (22.2).
 */
export const trackerConfig = {
  minSupportedVersion: "0.1.0",
  telemetry: {
    intervalSeconds: 5,
    /** Detailed raw telemetry is retained for this long before aggregation/expiry (18.3). */
    rawRetentionDays: 30,
  },
  antiCheat: {
    maxPlausibleGroundSpeedKts: 500,
    maxCoordinateJumpNmPerSecond: 5,
    maxAllowedSimRate: 4,
    maxPlausibleLandingRateFpm: 1000,
    fuelToleranceGallons: 5,
  },
  departure: {
    requireOriginProximityNm: 1,
    requireAirborneConfirmation: true,
  },
  arrival: {
    requireDestinationProximityNm: 1,
    requireOnGroundState: true,
  },
} as const;

export type TrackerConfig = typeof trackerConfig;
