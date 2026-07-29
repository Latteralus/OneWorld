import { describe, expect, it } from "vitest";
import {
  calculatePassengersGeneratedThisInterval,
  canReservePassengers,
} from "../domain/passenger.rules.js";

describe("calculatePassengersGeneratedThisInterval", () => {
  it("generates a fraction of the gap toward target, scaled by activity", () => {
    // gap = 75 - 25 = 50; base rate 0.1; modifier 1.0 -> 5
    expect(calculatePassengersGeneratedThisInterval(25, 75, 1.0)).toBe(5);
  });

  it("never exceeds the remaining gap even with a high modifier", () => {
    // gap = 75 - 73 = 2; raw = 2 * 0.1 * 15 = 3, which would overshoot the gap.
    expect(calculatePassengersGeneratedThisInterval(73, 75, 15.0)).toBe(2);
  });

  it("generates nothing once waiting count has reached the target", () => {
    expect(calculatePassengersGeneratedThisInterval(75, 75, 1.0)).toBe(0);
    expect(calculatePassengersGeneratedThisInterval(80, 75, 1.0)).toBe(0);
  });
});

describe("canReservePassengers", () => {
  it("allows reserving up to the full waiting count", () => {
    expect(canReservePassengers(10, 10)).toBe(true);
    expect(canReservePassengers(10, 5)).toBe(true);
  });

  it("prevents the pool from going negative (spec section 13.5)", () => {
    expect(canReservePassengers(10, 11)).toBe(false);
    expect(canReservePassengers(0, 1)).toBe(false);
  });

  it("rejects a zero or negative request", () => {
    expect(canReservePassengers(10, 0)).toBe(false);
    expect(canReservePassengers(10, -1)).toBe(false);
  });
});
