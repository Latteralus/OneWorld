import { describe, expect, it } from "vitest";
import { calculateTrainingEligibility } from "../domain/training.rules.js";
import type { PilotHourTotals } from "@oneworld/domain-qualifications";

const zeroHours: PilotHourTotals = {
  total: 0,
  pic: 0,
  singleEnginePiston: 0,
  multiEnginePiston: 0,
  turboprop: 0,
  jet: 0,
  day: 0,
  night: 0,
  instrument: 0,
  crossCountry: 0,
};

describe("calculateTrainingEligibility", () => {
  it("is eligible for PPL with no prerequisites or hours (spec section 17.3)", () => {
    const result = calculateTrainingEligibility({
      qualificationKey: "PPL",
      ownedQualifications: [],
      hours: zeroHours,
    });
    expect(result.eligible).toBe(true);
  });

  it("blocks High-Performance until 20 total / 10 single-engine hours are met", () => {
    const result = calculateTrainingEligibility({
      qualificationKey: "HIGH_PERFORMANCE",
      ownedQualifications: ["PPL"],
      hours: { ...zeroHours, total: 15, singleEnginePiston: 15 },
    });
    expect(result.eligible).toBe(false);
    expect(result.unmetHourRequirements).toEqual([{ category: "total", required: 20, actual: 15 }]);
  });

  it("reports missing prerequisites for Multi-Engine without Instrument", () => {
    const result = calculateTrainingEligibility({
      qualificationKey: "MULTI_ENGINE",
      ownedQualifications: ["PPL"],
      hours: { ...zeroHours, total: 100 },
    });
    expect(result.eligible).toBe(false);
    expect(result.missingPrerequisites).toEqual(["INSTRUMENT"]);
  });

  it("is eligible once prerequisites and hours are satisfied", () => {
    const result = calculateTrainingEligibility({
      qualificationKey: "HIGH_PERFORMANCE",
      ownedQualifications: ["PPL"],
      hours: { ...zeroHours, total: 20, singleEnginePiston: 10 },
    });
    expect(result.eligible).toBe(true);
    expect(result.unmetHourRequirements).toHaveLength(0);
  });
});
