import {
  addCents,
  calculateGreatCircleDistanceNm,
  cents,
  nauticalMilesToStatuteMiles,
  scaleCents,
  type Cents,
  type GeoPoint,
} from "@oneworld/utils";
import { travelConfig } from "@oneworld/config";

/**
 * Estimated road miles between two points until a routing provider or
 * stored road network exists (spec section 11.3).
 */
export function estimateRoadDistanceMiles(a: GeoPoint, b: GeoPoint): number {
  const greatCircleNm = calculateGreatCircleDistanceNm(a, b);
  const greatCircleMiles = nauticalMilesToStatuteMiles(greatCircleNm);
  return greatCircleMiles * travelConfig.roadDistanceMultiplier;
}

/** Personal-vehicle travel duration in minutes (spec section 11.3). */
export function calculateGroundTravelDurationMinutes(
  distanceMiles: number,
  effectiveTravelSpeedMph: number,
): number {
  if (effectiveTravelSpeedMph <= 0) {
    throw new RangeError("effectiveTravelSpeedMph must be positive");
  }
  return (distanceMiles / effectiveTravelSpeedMph) * 60;
}

/**
 * Fuel consumption for a ground trip is owned by the vehicle domain
 * (`calculateVehicleFuelUse` in `@oneworld/domain-vehicles`, spec section
 * 21.4) - the travel domain calls it rather than duplicating the formula.
 */

/** Bus duration in minutes, including boarding time (spec section 11.4). */
export function calculateBusDurationMinutes(distanceMiles: number): number {
  const drivingMinutes = (distanceMiles / travelConfig.bus.speedMph) * 60;
  return drivingMinutes + travelConfig.bus.boardingMinutes;
}

/** Bus fare in cents (spec section 11.4). */
export function calculateBusFareCents(distanceMiles: number): Cents {
  const perMile = scaleCents(cents(travelConfig.bus.perMileFareCents), Math.round(distanceMiles));
  return addCents(cents(travelConfig.bus.baseFareCents), perMile);
}
