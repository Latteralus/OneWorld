/**
 * Ground travel balance values (spec section 11).
 */
export const travelConfig = {
  /** Multiplier applied to great-circle miles until a routing provider exists (11.3). */
  roadDistanceMultiplier: 1.25,

  bus: {
    speedMph: 40,
    boardingMinutes: 30,
    baseFareCents: 1_500,
    perMileFareCents: 20,
  },
} as const;

export type TravelConfig = typeof travelConfig;
