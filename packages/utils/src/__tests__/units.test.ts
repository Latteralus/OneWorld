import { describe, expect, it } from "vitest";
import {
  knotsToMph,
  mphToKnots,
  nauticalMilesToStatuteMiles,
  poundsToKilograms,
  statuteMilesToNauticalMiles,
} from "../units.js";

describe("units", () => {
  it("converts between nautical and statute miles", () => {
    expect(nauticalMilesToStatuteMiles(1)).toBeCloseTo(1.15078, 4);
    expect(statuteMilesToNauticalMiles(1.15078)).toBeCloseTo(1, 4);
  });

  it("round-trips nm -> sm -> nm", () => {
    const original = 262;
    const roundTripped = statuteMilesToNauticalMiles(nauticalMilesToStatuteMiles(original));
    expect(roundTripped).toBeCloseTo(original, 6);
  });

  it("converts knots and mph", () => {
    expect(knotsToMph(100)).toBeCloseTo(115.078, 2);
    expect(mphToKnots(115.078)).toBeCloseTo(100, 2);
  });

  it("converts pounds to kilograms", () => {
    expect(poundsToKilograms(2500)).toBeCloseTo(1133.98, 1);
  });
});
