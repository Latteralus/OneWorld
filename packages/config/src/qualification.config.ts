/**
 * Preview qualification progression requirements (spec section 17.3).
 * The UI must read these through the qualification service rather than
 * re-implementing the rules (17.5).
 */
export const qualificationDefinitions = [
  {
    key: "PPL",
    name: "Private Pilot License",
    prerequisites: [] as string[],
    requiredHours: {},
    tuitionCents: 0,
    durationHours: 0,
    requiresCheckFlight: false,
  },
  {
    key: "HIGH_PERFORMANCE",
    name: "High-Performance Endorsement",
    prerequisites: ["PPL"],
    requiredHours: { total: 20, singleEnginePiston: 10 },
    tuitionCents: 250_000, // $2,500
    durationHours: 4,
    requiresCheckFlight: true,
  },
  {
    key: "INSTRUMENT",
    name: "Instrument Rating",
    prerequisites: ["PPL"],
    requiredHours: { total: 40 },
    additionalRequirements: ["cross_country", "night"],
    tuitionCents: 800_000, // $8,000
    durationHours: 24,
    requiresCheckFlight: true,
  },
  {
    key: "MULTI_ENGINE",
    name: "Multi-Engine Rating",
    prerequisites: ["INSTRUMENT"],
    requiredHours: { total: 75 },
    additionalRequirements: ["cross_country"],
    tuitionCents: 1_200_000, // $12,000
    durationHours: 48,
    requiresCheckFlight: true,
  },
] as const;

export const qualificationConfig = {
  definitions: qualificationDefinitions,
} as const;

export type QualificationConfig = typeof qualificationConfig;
export type QualificationKey = (typeof qualificationDefinitions)[number]["key"];
