/**
 * Preview housing categories and social status scale (spec section 9).
 */
export const residenceTypes = [
  {
    key: "run_down_apartment",
    name: "Run-Down Apartment",
    weeklyRentCents: 80_000,
    quality: "very_poor",
    parkingCapacity: 1,
    statusScore: 1,
  },
  {
    key: "basic_apartment",
    name: "Basic Apartment",
    weeklyRentCents: 120_000,
    quality: "poor",
    parkingCapacity: 1,
    statusScore: 2,
  },
  {
    key: "comfortable_apartment",
    name: "Comfortable Apartment",
    weeklyRentCents: 180_000,
    quality: "fair",
    parkingCapacity: 1,
    statusScore: 4,
  },
  {
    key: "townhouse",
    name: "Townhouse",
    weeklyRentCents: 260_000,
    quality: "good",
    parkingCapacity: 2,
    statusScore: 6,
  },
  {
    key: "suburban_house",
    name: "Suburban House",
    weeklyRentCents: 350_000,
    quality: "very_good",
    parkingCapacity: 3,
    statusScore: 8,
  },
] as const;

/** Public status labels, low to high (section 9.3). Index = score band. */
export const socialStatusLabels = [
  "Destitute",
  "Poor",
  "Lower Class",
  "Upper-Lower Class",
  "Lower-Middle Class",
  "Middle Class",
  "Upper-Middle Class",
  "Affluent",
  "Wealthy",
  "High Society",
  "Elite",
] as const;

export const housingConfig = {
  /** Grace period before an overdue tenancy moves toward eviction (35.11). */
  rentGracePeriodHours: 72,
  /** Fallback state so housing failure never blocks flying (9.1). */
  temporaryLodgingWeeklyCostCents: 40_000,
  residenceTypes,
  socialStatusLabels,
} as const;

export type HousingConfig = typeof housingConfig;
export type SocialStatusLabel = (typeof socialStatusLabels)[number];
