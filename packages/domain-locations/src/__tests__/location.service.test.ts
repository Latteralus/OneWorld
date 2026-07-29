import { describe, expect, it } from "vitest";
import { asAirportId, asCityId, asPlayerId } from "@oneworld/contracts";
import { LocationService } from "../application/location.service.js";
import { InMemoryLocationRepository } from "../infrastructure/location.repository.memory.js";

describe("LocationService", () => {
  it("has no location until one is set", async () => {
    const service = new LocationService(new InMemoryLocationRepository());
    const playerId = asPlayerId("player-1");
    await expect(service.getLocation(playerId)).resolves.toBeUndefined();
  });

  it("sets and reads back a city-residence location", async () => {
    const service = new LocationService(new InMemoryLocationRepository());
    const playerId = asPlayerId("player-1");
    const cityId = asCityId("city-1");

    await service.setLocation({ playerId, locationType: "CITY_RESIDENCE", cityId });
    const location = await service.getLocation(playerId);

    expect(location).toEqual({ playerId, locationType: "CITY_RESIDENCE", cityId });
  });

  it("overwrites the previous location on the next set (single current-state record)", async () => {
    const service = new LocationService(new InMemoryLocationRepository());
    const playerId = asPlayerId("player-1");

    await service.setLocation({
      playerId,
      locationType: "CITY_RESIDENCE",
      cityId: asCityId("city-1"),
    });
    await service.setLocation({
      playerId,
      locationType: "AIRPORT",
      airportId: asAirportId("airport-1"),
    });

    const location = await service.getLocation(playerId);
    expect(location?.locationType).toBe("AIRPORT");
  });
});
