import { describe, expect, it } from "vitest";
import { asAirportId } from "@oneworld/contracts";
import { AirportService } from "../application/airport.service.js";
import { InMemoryAirportRepository } from "../infrastructure/airport.repository.memory.js";
import type { AirportSummary } from "../domain/catalog.types.js";

function airport(overrides: Partial<AirportSummary> & Pick<AirportSummary, "id">): AirportSummary {
  return {
    ident: overrides.id,
    icao: overrides.id,
    localCode: undefined,
    name: `${overrides.id} Airport`,
    municipality: "Somewhere",
    regionCode: "US-CO",
    countryCode: "US",
    latitude: 39.7392,
    longitude: -104.9903,
    elevationFt: 5000,
    physicalTier: "local_airport",
    previewEnabled: true,
    activityScore: 0,
    activityClass: "quiet",
    ...overrides,
  };
}

describe("AirportService.search", () => {
  it("matches by ident/name/municipality, case-insensitively", async () => {
    const repo = new InMemoryAirportRepository();
    repo.seedAirport(airport({ id: asAirportId("KDEN"), name: "Denver International Airport" }));
    repo.seedAirport(airport({ id: asAirportId("KPHX"), name: "Phoenix Sky Harbor" }));
    const service = new AirportService(repo);

    const results = await service.search({ query: "denver" });
    expect(results).toHaveLength(1);
    expect(results[0]?.ident).toBe("KDEN");
  });

  it("excludes airports that are not preview-enabled", async () => {
    const repo = new InMemoryAirportRepository();
    repo.seedAirport(airport({ id: asAirportId("KDEN") }));
    repo.seedAirport(
      airport({ id: asAirportId("EGLL"), countryCode: "GB", previewEnabled: false }),
    );
    const service = new AirportService(repo);

    const results = await service.search({});
    expect(results.map((a) => a.ident)).toEqual(["KDEN"]);
  });

  it("filters by maximum distance from a point", async () => {
    const repo = new InMemoryAirportRepository();
    repo.seedAirport(
      airport({ id: asAirportId("KAPA"), latitude: 39.5701, longitude: -104.849 }), // ~15nm from KDEN
    );
    repo.seedAirport(
      airport({ id: asAirportId("KPHX"), latitude: 33.4484, longitude: -112.074 }), // far away
    );
    const service = new AirportService(repo);

    const results = await service.search({
      near: { latitude: 39.7392, longitude: -104.9903, maxDistanceNm: 50 },
    });
    expect(results.map((a) => a.ident)).toEqual(["KAPA"]);
  });
});

describe("AirportService.listNearby", () => {
  it("returns airports sorted nearest-first with distance, excluding the origin", async () => {
    const repo = new InMemoryAirportRepository();
    const origin = airport({ id: asAirportId("KDEN"), latitude: 39.8617, longitude: -104.6737 });
    repo.seedAirport(origin);
    repo.seedAirport(airport({ id: asAirportId("KAPA"), latitude: 39.5701, longitude: -104.849 }));
    repo.seedAirport(airport({ id: asAirportId("KBJC"), latitude: 39.9088, longitude: -105.1172 }));
    const service = new AirportService(repo);

    const nearby = await service.listNearby(origin, 75, 5);
    expect(nearby.every((a) => a.id !== origin.id)).toBe(true);
    expect(nearby[0]!.distanceNm).toBeLessThanOrEqual(nearby[1]?.distanceNm ?? Infinity);
  });
});

describe("AirportService.ensureGameState", () => {
  it("is idempotent", async () => {
    const repo = new InMemoryAirportRepository();
    const airportId = asAirportId("KDEN");
    await new AirportService(repo).ensureGameState({
      airportId,
      physicalTier: "international_hub",
    });
    await new AirportService(repo).ensureGameState({
      airportId,
      physicalTier: "international_hub",
    });
    expect(repo.hasGameState(airportId)).toBe(true);
  });
});
