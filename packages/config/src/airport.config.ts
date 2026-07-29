/**
 * Airport physical tiers, activity classes, and passenger-target modifiers
 * (spec sections 12.3, 13.3, 15.4).
 */
export const airportPhysicalTiers = [
  "small_airfield",
  "local_airport",
  "regional_airport",
  "major_airport",
  "international_hub",
] as const;

export const airportActivityClasses = ["quiet", "light", "active", "busy", "major_hub"] as const;

export const basePassengerTargetByTier: Record<(typeof airportPhysicalTiers)[number], number> = {
  small_airfield: 10,
  local_airport: 30,
  regional_airport: 75,
  major_airport: 200,
  international_hub: 600,
};

export const passengerTargetModifierByActivity: Record<
  (typeof airportActivityClasses)[number],
  number
> = {
  quiet: 0.75,
  light: 0.9,
  active: 1.0,
  busy: 1.2,
  major_hub: 1.5,
};

export const airportConfig = {
  physicalTiers: airportPhysicalTiers,
  activityClasses: airportActivityClasses,
  basePassengerTargetByTier,
  passengerTargetModifierByActivity,
  /** Bounded decay so activity reflects recent use without erasing history (15.3). */
  activityDecayPointsPerHour: 1,
  activityDecayFloor: 0,
  /**
   * Resolves spec section 35 open item #2 ("preview region vs. worldwide
   * airports"): the preview launches U.S.-only. An imported airport gets
   * `previewEnabled = true` when its country code is in this list and its
   * status is active - see `@oneworld/data-import-airports`'s
   * `isPreviewEligible`. Placeholder pending real curation/testing.
   */
  previewCountryCodes: ["US"] as string[],
} as const;

export type AirportConfig = typeof airportConfig;
export type AirportPhysicalTier = (typeof airportPhysicalTiers)[number];
export type AirportActivityClass = (typeof airportActivityClasses)[number];
