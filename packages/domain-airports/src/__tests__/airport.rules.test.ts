import { describe, expect, it } from "vitest";
import {
  calculateActivityPointsForCompletedFlight,
  calculateAirportPassengerTarget,
  decayActivityScore,
} from "../domain/airport.rules.js";

describe("calculateAirportPassengerTarget", () => {
  it("scales the base tier target by the activity modifier (spec sections 13.3, 15.4)", () => {
    expect(calculateAirportPassengerTarget("regional_airport", "active")).toBe(75); // 75 * 1.0
    expect(calculateAirportPassengerTarget("regional_airport", "busy")).toBe(90); // 75 * 1.2
    expect(calculateAirportPassengerTarget("small_airfield", "quiet")).toBe(8); // round(10 * 0.75)
  });
});

describe("decayActivityScore", () => {
  it("decays toward the floor without going negative", () => {
    expect(decayActivityScore(10, 5)).toBe(5);
    expect(decayActivityScore(3, 10)).toBe(0);
  });

  it("rejects negative elapsed hours", () => {
    expect(() => decayActivityScore(10, -1)).toThrow(RangeError);
  });
});

describe("calculateActivityPointsForCompletedFlight", () => {
  it("awards one point per departing and arriving passenger plus a completion bonus", () => {
    const points = calculateActivityPointsForCompletedFlight(3);
    expect(points).toEqual({
      departurePoints: 3,
      arrivalPoints: 3,
      completionBonus: 1,
      total: 7,
    });
  });
});
