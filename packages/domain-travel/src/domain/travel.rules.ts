import {
  addCents,
  calculateGreatCircleDistanceNm,
  cents,
  nauticalMilesToStatuteMiles,
  scaleCents,
  type Cents,
  type GeoPoint,
} from "@oneworld/utils";
import { travelConfig, vehicleConfig } from "@oneworld/config";
import { calculateVehicleFuelCostCents, calculateVehicleFuelUseGallons } from "@oneworld/domain-vehicles";
import type { PlayerLocation } from "@oneworld/domain-locations";
import type {
  GroundTravelQuote,
  GroundTravelQuoteInput,
  TravelEndpoint,
  TravelEndpointRef,
} from "./travel.types.js";

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

/**
 * Full ground-travel quote for either mode (spec section 11.3-11.4). The
 * only place that composes distance/duration/cost/fuel into one result -
 * callers (`TravelService.quoteTravel`) never assemble these fields
 * themselves.
 */
export function calculateGroundTravelQuote(input: GroundTravelQuoteInput): GroundTravelQuote {
  const distanceMiles = estimateRoadDistanceMiles(input.origin.point, input.destination.point);

  if (input.mode === "bus") {
    return {
      mode: "bus",
      distanceMiles,
      durationMinutes: calculateBusDurationMinutes(distanceMiles),
      costCents: calculateBusFareCents(distanceMiles),
    };
  }

  if (!input.vehicle) {
    throw new RangeError("A vehicle is required to quote personal_vehicle travel");
  }
  const fuelGallonsUsed = calculateVehicleFuelUseGallons(distanceMiles, input.vehicle.fuelEfficiencyMpg);
  return {
    mode: "personal_vehicle",
    distanceMiles,
    durationMinutes: calculateGroundTravelDurationMinutes(
      distanceMiles,
      input.vehicle.effectiveTravelSpeedMph,
    ),
    // The preview auto-purchases exactly the fuel a trip burns
    // (`vehicleConfig.autoPurchaseFuelOnTravel`), so the trip's cost is
    // that fuel purchase (spec section 10.4).
    costCents: calculateVehicleFuelCostCents(
      fuelGallonsUsed,
      vehicleConfig.groundFuelPricePerGallonDollars,
    ),
    fuelGallonsUsed,
  };
}

export function isTravelDue(arrivesAt: Date, referenceNow: Date): boolean {
  return arrivesAt.getTime() <= referenceNow.getTime();
}

/**
 * Whether the player's current location is the stated origin (spec
 * section 11.1: "a player can only begin... at the airport/city where the
 * player is physically located"). Also the natural guard against starting
 * travel while `IN_GROUND_TRANSIT`/`IN_SIMULATOR_FLIGHT`, since neither
 * matches a `"city"`/`"airport"` origin.
 */
export function doesLocationMatchOrigin(location: PlayerLocation, origin: TravelEndpointRef): boolean {
  if (origin.type === "city") {
    return location.locationType === "CITY_RESIDENCE" && location.cityId === origin.cityId;
  }
  return location.locationType === "AIRPORT" && location.airportId === origin.airportId;
}

/** Strips the quote-time `point: GeoPoint` down to the id-only shape persisted records use. */
export function toEndpointRef(endpoint: TravelEndpoint): TravelEndpointRef {
  if (endpoint.type === "city") {
    if (!endpoint.cityId) throw new RangeError('A "city" travel endpoint requires cityId');
    return { type: "city", cityId: endpoint.cityId };
  }
  if (!endpoint.airportId) throw new RangeError('An "airport" travel endpoint requires airportId');
  return { type: "airport", airportId: endpoint.airportId };
}
