/**
 * Starting-state grants for new players (spec section 6).
 * Money fields are in USD cents to avoid floating-point settlement bugs
 * (section 31.2).
 */
export const onboardingConfig = {
  startingLicense: "PPL" as const,

  startingResidence: {
    name: "Run-Down Apartment",
    weeklyRentCents: 80_000, // $800
    quality: "very_poor" as const,
    parkingCapacity: 1,
    statusContribution: "low" as const,
  },

  startingVehicle: {
    name: "1996 Hunda Attord",
    startingValueCents: 50_000, // $500
    startingMileageMin: 170_000,
    startingMileageMax: 235_000,
    expectedLifespanMiles: 250_000,
    weeklyMaintenanceCents: 2_500, // $25
    fuelEfficiencyMpg: 24,
    tankCapacityGallons: 16,
    effectiveTravelSpeedMph: 55,
    quality: "very_poor" as const,
    reliability: "low" as const,
    statusContribution: "low" as const,
    /** Matches the "very poor" tier's score on `housingConfig.residenceTypes` (section 9.3). */
    statusScore: 1,
  },

  /**
   * Guardrails from section 6.6 so the first session is short, affordable,
   * and explains itself before money changes hands.
   */
  protections: {
    firstTravelMaxMinutes: 20,
    firstFlightMaxRangeNm: 50,
    requireProfitabilityEstimateBeforeFirstJob: true,
    directPlayerToApplyForCivilianJob: true,
  },
} as const;

export type OnboardingConfig = typeof onboardingConfig;
