import { describe, expect, it } from "vitest";
import { fixtureAirports } from "@oneworld/testing";
import type { AirportId, CityId, PlayerId } from "@oneworld/contracts";
import type { PlayerLocation } from "@oneworld/domain-locations";
import { calculateVehicleFuelCostCents, calculateVehicleFuelUseGallons } from "@oneworld/domain-vehicles";
import {
  calculateBusDurationMinutes,
  calculateBusFareCents,
  calculateGroundTravelDurationMinutes,
  calculateGroundTravelQuote,
  doesLocationMatchOrigin,
  estimateRoadDistanceMiles,
  isTravelDue,
  toEndpointRef,
} from "../domain/travel.rules.js";
import type { TravelEndpoint } from "../domain/travel.types.js";

const [kboi, kmyl] = fixtureAirports;
const kboiId = "airport-kboi" as AirportId;
const kmylId = "airport-kmyl" as AirportId;
const origin: TravelEndpoint = { type: "airport", airportId: kboiId, point: kboi };
const destination: TravelEndpoint = { type: "airport", airportId: kmylId, point: kmyl };

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

describe("calculateGroundTravelQuote", () => {
  it("quotes bus travel using the bus duration/fare formulas", () => {
    const quote = calculateGroundTravelQuote({ mode: "bus", origin, destination });
    const distanceMiles = estimateRoadDistanceMiles(kboi, kmyl);

    expect(quote.mode).toBe("bus");
    expect(quote.distanceMiles).toBeCloseTo(distanceMiles, 5);
    expect(quote.durationMinutes).toBeCloseTo(calculateBusDurationMinutes(distanceMiles), 5);
    expect(quote.costCents).toBe(calculateBusFareCents(distanceMiles));
    expect(quote.fuelGallonsUsed).toBeUndefined();
  });

  it("quotes personal_vehicle travel using the vehicle's speed/MPG and the configured ground-fuel price", () => {
    const quote = calculateGroundTravelQuote({
      mode: "personal_vehicle",
      origin,
      destination,
      vehicle: { id: "vehicle-1" as never, effectiveTravelSpeedMph: 55, fuelEfficiencyMpg: 24 },
    });
    const distanceMiles = estimateRoadDistanceMiles(kboi, kmyl);
    const expectedFuelGallonsUsed = calculateVehicleFuelUseGallons(distanceMiles, 24);

    expect(quote.mode).toBe("personal_vehicle");
    expect(quote.durationMinutes).toBeCloseTo(calculateGroundTravelDurationMinutes(distanceMiles, 55), 5);
    expect(quote.fuelGallonsUsed).toBeCloseTo(expectedFuelGallonsUsed, 5);
    expect(quote.costCents).toBe(calculateVehicleFuelCostCents(expectedFuelGallonsUsed, 3.5));
  });

  it("rejects personal_vehicle mode without a vehicle", () => {
    expect(() => calculateGroundTravelQuote({ mode: "personal_vehicle", origin, destination })).toThrow(
      RangeError,
    );
  });
});

describe("isTravelDue", () => {
  it("is due once the reference time reaches arrivesAt", () => {
    const arrivesAt = new Date("2026-07-28T09:00:00Z");
    expect(isTravelDue(arrivesAt, new Date("2026-07-28T09:00:00Z"))).toBe(true);
    expect(isTravelDue(arrivesAt, new Date("2026-07-28T08:59:00Z"))).toBe(false);
  });
});

describe("doesLocationMatchOrigin", () => {
  const playerId = "player-1" as PlayerId;
  const cityId = "city-1" as CityId;
  const airportId = "airport-1" as AirportId;

  it("matches a CITY_RESIDENCE location to a same-city origin", () => {
    const location: PlayerLocation = { playerId, locationType: "CITY_RESIDENCE", cityId };
    expect(doesLocationMatchOrigin(location, { type: "city", cityId })).toBe(true);
    expect(doesLocationMatchOrigin(location, { type: "city", cityId: "city-2" as CityId })).toBe(false);
  });

  it("matches an AIRPORT location to a same-airport origin", () => {
    const location: PlayerLocation = { playerId, locationType: "AIRPORT", airportId };
    expect(doesLocationMatchOrigin(location, { type: "airport", airportId })).toBe(true);
    expect(doesLocationMatchOrigin(location, { type: "airport", airportId: "airport-2" as AirportId })).toBe(
      false,
    );
  });

  it("never matches while IN_GROUND_TRANSIT or IN_SIMULATOR_FLIGHT", () => {
    const inTransit: PlayerLocation = {
      playerId,
      locationType: "IN_GROUND_TRANSIT",
      activeTravelId: "travel-1" as never,
    };
    const inFlight: PlayerLocation = { playerId, locationType: "IN_SIMULATOR_FLIGHT", activeFlightId: "f-1" };
    expect(doesLocationMatchOrigin(inTransit, { type: "city", cityId })).toBe(false);
    expect(doesLocationMatchOrigin(inFlight, { type: "airport", airportId })).toBe(false);
  });
});

describe("toEndpointRef", () => {
  it("strips the GeoPoint down to the id-only shape for a city endpoint", () => {
    const cityId = "city-1" as CityId;
    expect(toEndpointRef({ type: "city", cityId, point: kboi })).toEqual({ type: "city", cityId });
  });

  it("strips the GeoPoint down to the id-only shape for an airport endpoint", () => {
    expect(toEndpointRef({ type: "airport", airportId: kboiId, point: kboi })).toEqual({
      type: "airport",
      airportId: kboiId,
    });
  });

  it("throws when the expected id is missing for the endpoint's type", () => {
    expect(() => toEndpointRef({ type: "city", point: kboi })).toThrow(RangeError);
    expect(() => toEndpointRef({ type: "airport", point: kboi })).toThrow(RangeError);
  });
});
