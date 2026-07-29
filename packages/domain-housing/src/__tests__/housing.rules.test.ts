import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import { calculateStatusScore } from "../domain/housing.rules.js";

describe("calculateStatusScore", () => {
  it("places a brand-new player near the bottom of the scale (spec section 6.5/9.3)", () => {
    const result = calculateStatusScore({
      housingStatusScore: 1, // Run-Down Apartment
      vehicleStatusScore: 0, // 1996 Hunda Attord, "low" contribution
      personalLiquidityCents: cents(250_000), // $2,500 starting balance
      hasStableEmployment: false,
    });
    // 1 + 0 + floor(2500/2500)=1 + 0 = 2
    expect(result.score).toBe(2);
    expect(result.label).toBe("Lower Class");
  });

  it("clamps at the top of the scale", () => {
    const result = calculateStatusScore({
      housingStatusScore: 8,
      vehicleStatusScore: 8,
      personalLiquidityCents: cents(10_000_000),
      hasStableEmployment: true,
    });
    expect(result.score).toBe(10);
    expect(result.label).toBe("Elite");
  });

  it("never goes below zero", () => {
    const result = calculateStatusScore({
      housingStatusScore: 0,
      vehicleStatusScore: 0,
      personalLiquidityCents: cents(0),
      hasStableEmployment: false,
    });
    expect(result.score).toBe(0);
    expect(result.label).toBe("Destitute");
  });
});
