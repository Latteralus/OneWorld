import { describe, expect, it } from "vitest";
import { fixtureAirports } from "@oneworld/testing";
import {
  calculateBusDurationMinutes,
  calculateBusFareCents,
  calculateGroundTravelDurationMinutes,
  estimateRoadDistanceMiles,
} from "../domain/travel.rules.js";

const [kboi, kmyl] = fixtureAirports;

describe("estimateRoadDistanceMiles", () => {
  it("applies the configured road-distance multiplier over the great-circle distance", () => {
    const distance = estimateRoadDistanceMiles(kboi, kmyl);
    expect(distance).toBeGreaterThan(0);
    // Sanity bound: KBOI-KMYL great circle is roughly 90 SM, *1.25 multiplier.
    expect(distance).toBeGreaterThan(80);
    expect(distance).toBeLessThan(160);
  });
});

describe("calculateGroundTravelDurationMinutes", () => {
  it("matches distance / speed * 60", () => {
    expect(calculateGroundTravelDurationMinutes(55, 55)).toBeCloseTo(60, 5);
    expect(calculateGroundTravelDurationMinutes(110, 55)).toBeCloseTo(120, 5);
  });

  it("rejects a non-positive speed", () => {
    expect(() => calculateGroundTravelDurationMinutes(10, 0)).toThrow(RangeError);
  });
});

describe("calculateBusDurationMinutes", () => {
  it("adds fixed boarding time to the driving time", () => {
    // 40 mph bus speed, 30 min boarding (default config) -> 40 miles = 60 + 30 = 90 min.
    expect(calculateBusDurationMinutes(40)).toBeCloseTo(90, 5);
  });
});

describe("calculateBusFareCents", () => {
  it("matches $15 base + $0.20/mile", () => {
    expect(calculateBusFareCents(0)).toBe(1_500);
    expect(calculateBusFareCents(50)).toBe(1_500 + 50 * 20);
  });
});
