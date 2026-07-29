import { describe, expect, it } from "vitest";
import { asFlightSessionId } from "@oneworld/contracts";
import {
  isImplausibleCoordinateJump,
  isPlausibleGroundSpeed,
  isPlausibleLandingRate,
  isPlausibleSimRate,
  isWithinFuelTolerance,
} from "../domain/telemetry.rules.js";
import type { TelemetrySample } from "../domain/telemetry.types.js";

function sample(overrides: Partial<TelemetrySample>): TelemetrySample {
  return {
    flightSessionId: asFlightSessionId("flight-1"),
    sequence: 0,
    timestamp: new Date("2026-07-28T00:00:00Z"),
    latitude: 43.5644,
    longitude: -116.2228,
    altitudeMslFt: 3000,
    groundSpeedKts: 120,
    onGround: false,
    engineRunning: true,
    fuelGallons: 30,
    simRate: 1,
    slew: false,
    paused: false,
    ...overrides,
  };
}

describe("isPlausibleGroundSpeed", () => {
  it("accepts normal cruise speeds and rejects impossible ones", () => {
    expect(isPlausibleGroundSpeed(sample({ groundSpeedKts: 150 }))).toBe(true);
    expect(isPlausibleGroundSpeed(sample({ groundSpeedKts: 900 }))).toBe(false);
    expect(isPlausibleGroundSpeed(sample({ groundSpeedKts: -5 }))).toBe(false);
  });
});

describe("isPlausibleSimRate", () => {
  it("rejects sim rates above the configured maximum", () => {
    expect(isPlausibleSimRate(sample({ simRate: 1 }))).toBe(true);
    expect(isPlausibleSimRate(sample({ simRate: 8 }))).toBe(false);
  });
});

describe("isImplausibleCoordinateJump", () => {
  it("allows normal cruise-speed movement between samples", () => {
    const previous = sample({
      latitude: 43.5644,
      longitude: -116.2228,
      timestamp: new Date("2026-07-28T00:00:00Z"),
    });
    const current = sample({
      latitude: 43.5744,
      longitude: -116.2228,
      timestamp: new Date("2026-07-28T00:01:00Z"),
    });
    expect(isImplausibleCoordinateJump(previous, current)).toBe(false);
  });

  it("flags a teleport across hundreds of miles in one second", () => {
    const previous = sample({
      latitude: 43.5644,
      longitude: -116.2228,
      timestamp: new Date("2026-07-28T00:00:00Z"),
    });
    const current = sample({
      latitude: 40.7899,
      longitude: -111.9791,
      timestamp: new Date("2026-07-28T00:00:01Z"),
    });
    expect(isImplausibleCoordinateJump(previous, current)).toBe(true);
  });
});

describe("isWithinFuelTolerance / isPlausibleLandingRate", () => {
  it("checks fuel drift against the configured tolerance", () => {
    expect(isWithinFuelTolerance(30, 32)).toBe(true);
    expect(isWithinFuelTolerance(30, 40)).toBe(false);
  });

  it("checks landing rate against the configured maximum", () => {
    expect(isPlausibleLandingRate(-250)).toBe(true);
    expect(isPlausibleLandingRate(-1500)).toBe(false);
  });
});
