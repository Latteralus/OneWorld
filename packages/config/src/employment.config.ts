/**
 * Civilian employment balance values (spec section 8). Daily wages are
 * configuration, not hard-coded rules - tune these via admin config in
 * production; the values below are the documented preview defaults.
 */
export const employmentJobTemplates = [
  { key: "dishwasher", title: "Dishwasher", dailyWageCents: 10_500, availability: "very_high" },
  {
    key: "fast_food_worker",
    title: "Fast-Food Worker",
    dailyWageCents: 11_500,
    availability: "very_high",
  },
  {
    key: "convenience_store_clerk",
    title: "Convenience Store Clerk",
    dailyWageCents: 12_000,
    availability: "high",
  },
  {
    key: "hotel_housekeeper",
    title: "Hotel Housekeeper",
    dailyWageCents: 12_500,
    availability: "high",
  },
  {
    key: "warehouse_worker",
    title: "Warehouse Worker",
    dailyWageCents: 13_500,
    availability: "high",
  },
  { key: "cook", title: "Cook", dailyWageCents: 14_000, availability: "medium" },
  { key: "bartender", title: "Bartender", dailyWageCents: 15_000, availability: "medium" },
  {
    key: "airport_ramp_worker",
    title: "Airport Ramp Worker",
    dailyWageCents: 15_500,
    availability: "medium",
  },
  { key: "fuel_attendant", title: "Fuel Attendant", dailyWageCents: 16_000, availability: "low" },
  {
    key: "airport_operations_assistant",
    title: "Airport Operations Assistant",
    dailyWageCents: 17_500,
    availability: "low",
  },
] as const;

export const employmentConfig = {
  /** A player may hold exactly one active job at a time (section 8.2). */
  maxActiveJobs: 1,
  /** Real-time delay before an application decision is revealed (8.6). */
  applicationDecisionDelayHoursMin: 2,
  applicationDecisionDelayHoursMax: 6,
  /** Low-wage jobs should have high acceptance rates (8.6). */
  baseAcceptanceRateByAvailability: {
    very_high: 0.97,
    high: 0.9,
    medium: 0.75,
    low: 0.55,
  },
  /** Daily payroll time in the display timezone (24h, section 8.7 / 35.10). */
  payrollHourLocal: 9,
  jobTemplates: employmentJobTemplates,
} as const;

export type EmploymentConfig = typeof employmentConfig;
export type EmploymentAvailability = (typeof employmentJobTemplates)[number]["availability"];
