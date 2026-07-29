import { calculateGreatCircleDistanceNm } from "@oneworld/utils";
import { trackerConfig } from "@oneworld/config";
import type { TelemetrySample } from "./telemetry.types.js";

/** Anti-cheat plausibility checks (spec section 18.6, 30.1). Pure and fixture-testable. */

export function isPlausibleGroundSpeed(sample: TelemetrySample): boolean {
  return (
    sample.groundSpeedKts >= 0 &&
    sample.groundSpeedKts <= trackerConfig.antiCheat.maxPlausibleGroundSpeedKts
  );
}

export function isPlausibleSimRate(sample: TelemetrySample): boolean {
  return sample.simRate <= trackerConfig.antiCheat.maxAllowedSimRate;
}

/**
 * Flags an implausible coordinate jump between two consecutive samples -
 * the core slew/teleport detector (section 18.6).
 */
export function isImplausibleCoordinateJump(
  previous: TelemetrySample,
  current: TelemetrySample,
): boolean {
  const elapsedSeconds = (current.timestamp.getTime() - previous.timestamp.getTime()) / 1000;
  if (elapsedSeconds <= 0) return false;

  const distanceNm = calculateGreatCircleDistanceNm(previous, current);
  const nmPerSecond = distanceNm / elapsedSeconds;
  return nmPerSecond > trackerConfig.antiCheat.maxCoordinateJumpNmPerSecond;
}

export function isWithinFuelTolerance(reportedGallons: number, expectedGallons: number): boolean {
  return (
    Math.abs(reportedGallons - expectedGallons) <= trackerConfig.antiCheat.fuelToleranceGallons
  );
}

export function isPlausibleLandingRate(landingRateFpm: number): boolean {
  return Math.abs(landingRateFpm) <= trackerConfig.antiCheat.maxPlausibleLandingRateFpm;
}
