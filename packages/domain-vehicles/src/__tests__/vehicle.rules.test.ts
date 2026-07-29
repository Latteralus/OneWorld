import { describe, expect, it } from "vitest";
import {
  calculateLifespanFractionUsed,
  calculateMileageAfterTrip,
  calculateVehicleFuelCostCents,
  calculateVehicleFuelUseGallons,
  pickRandomStartingMileage,
} from "../domain/vehicle.rules.js";

describe("calculateVehicleFuelUseGallons", () => {
  it("divides route miles by MPG", () => {
    // Starting car: ~24 MPG (spec section 6.4). 120 miles -> 5 gallons.
    expect(calculateVehicleFuelUseGallons(120, 24)).toBeCloseTo(5, 6);
  });

  it("rejects non-positive MPG", () => {
    expect(() => calculateVehicleFuelUseGallons(10, 0)).toThrow(RangeError);
  });
});

describe("calculateVehicleFuelCostCents", () => {
  it("multiplies gallons by price per gallon", () => {
    expect(calculateVehicleFuelCostCents(5, 3.5)).toBe(1_750);
  });
});

describe("calculateMileageAfterTrip", () => {
  it("adds route miles to current mileage", () => {
    expect(calculateMileageAfterTrip(200_000, 120)).toBe(200_120);
  });
});

describe("calculateLifespanFractionUsed", () => {
  it("computes the fraction and clamps at 1", () => {
    expect(calculateLifespanFractionUsed(125_000, 250_000)).toBeCloseTo(0.5, 6);
    expect(calculateLifespanFractionUsed(300_000, 250_000)).toBe(1);
  });
});

describe("pickRandomStartingMileage", () => {
  it("stays within the inclusive bounds across many draws", () => {
    // Starting car mileage range (spec section 6.4).
    for (let i = 0; i < 200; i += 1) {
      const mileage = pickRandomStartingMileage(170_000, 235_000);
      expect(mileage).toBeGreaterThanOrEqual(170_000);
      expect(mileage).toBeLessThanOrEqual(235_000);
      expect(Number.isInteger(mileage)).toBe(true);
    }
  });

  it("allows min === max", () => {
    expect(pickRandomStartingMileage(100, 100)).toBe(100);
  });

  it("rejects an invalid range", () => {
    expect(() => pickRandomStartingMileage(200, 100)).toThrow(RangeError);
  });
});
