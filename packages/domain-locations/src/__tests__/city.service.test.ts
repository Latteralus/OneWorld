import { describe, expect, it } from "vitest";
import { CityService } from "../application/city.service.js";
import { InMemoryCityRepository } from "../infrastructure/city.repository.memory.js";

function makeService() {
  const repo = new InMemoryCityRepository();
  repo.seedAirportIdent("KDEN", {
    name: "Denver International Airport",
    physicalTier: "international_hub",
  });
  repo.seedAirportIdent("KAPA", { name: "Centennial Airport", physicalTier: "regional_airport" });
  return { repo, service: new CityService(repo) };
}

describe("CityService.seedStartingCities", () => {
  it("creates one city per entry and links its airports", async () => {
    const { service, repo } = makeService();

    const cities = await service.seedStartingCities([
      {
        name: "Denver",
        region: "US-CO",
        countryCode: "US",
        latitude: 39.7392,
        longitude: -104.9903,
        employmentTier: "standard",
        airports: [
          { ident: "KDEN", isPrimary: true },
          { ident: "KAPA", isPrimary: false },
        ],
      },
    ]);

    expect(cities).toHaveLength(1);
    const denver = cities[0]!;
    expect(denver.name).toBe("Denver");

    const airports = await repo.listAirportsForCity(denver.id);
    expect(airports).toHaveLength(2);
    expect(airports.find((a) => a.ident === "KDEN")?.isPrimary).toBe(true);
  });

  it("is idempotent: seeding the same city twice does not duplicate it", async () => {
    const { service, repo } = makeService();
    const input = [
      {
        name: "Denver",
        region: "US-CO",
        countryCode: "US",
        latitude: 39.7392,
        longitude: -104.9903,
        employmentTier: "standard",
        airports: [{ ident: "KDEN", isPrimary: true }],
      },
    ];

    await service.seedStartingCities(input);
    await service.seedStartingCities(input);

    const cities = await repo.listCities();
    expect(cities).toHaveLength(1);
  });

  it("throws when an airport ident isn't in the canonical catalog", async () => {
    const { service } = makeService();
    await expect(
      service.seedStartingCities([
        {
          name: "Nowhere",
          region: "US-ZZ",
          countryCode: "US",
          latitude: 0,
          longitude: 0,
          employmentTier: "standard",
          airports: [{ ident: "KXXX", isPrimary: true }],
        },
      ]),
    ).rejects.toThrow(/KXXX/);
  });
});
