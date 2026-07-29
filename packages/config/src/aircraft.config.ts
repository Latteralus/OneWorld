/**
 * Curated preview aircraft catalog seed list (spec section 16.3).
 * These are the canonical types the preview supports; the simulator
 * mapping layer decides which installed sim titles satisfy each one.
 */
export const previewAircraftTypeSeeds = [
  { icaoType: "C152", manufacturer: "Cessna", model: "152", requiredQualification: "PPL" },
  { icaoType: "C172", manufacturer: "Cessna", model: "172", requiredQualification: "PPL" },
  {
    icaoType: "PA28",
    manufacturer: "Piper",
    model: "PA-28 (Cherokee/Archer family)",
    requiredQualification: "PPL",
  },
  { icaoType: "DA40", manufacturer: "Diamond", model: "DA40", requiredQualification: "PPL" },
  {
    icaoType: "C182",
    manufacturer: "Cessna",
    model: "182",
    requiredQualification: "HIGH_PERFORMANCE",
  },
  {
    icaoType: "C206",
    manufacturer: "Cessna",
    model: "206",
    requiredQualification: "HIGH_PERFORMANCE",
  },
  {
    icaoType: "BE36",
    manufacturer: "Beechcraft",
    model: "Bonanza",
    requiredQualification: "HIGH_PERFORMANCE",
  },
  { icaoType: "DA62", manufacturer: "Diamond", model: "DA62", requiredQualification: "MULTI_ENGINE" },
  {
    icaoType: "BE58",
    manufacturer: "Beechcraft",
    model: "Baron",
    requiredQualification: "MULTI_ENGINE",
  },
  {
    icaoType: "C208",
    manufacturer: "Cessna",
    model: "208 Caravan",
    requiredQualification: "TURBOPROP",
  },
] as const;

export const aircraftConfig = {
  previewAircraftTypeSeeds,
  /** Preview uses one rental pricing model for clarity (16.7, 35.4). */
  rentalPricingModel: "hourly_wet" as const,
  mappingStatuses: ["official", "community_verified", "automatically_inferred", "unsupported"] as const,
} as const;

export type AircraftConfig = typeof aircraftConfig;
