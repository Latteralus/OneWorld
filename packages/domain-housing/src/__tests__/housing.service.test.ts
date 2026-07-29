import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import type { CityId, PlayerId } from "@oneworld/contracts";
import { HousingService } from "../application/housing.service.js";
import { InMemoryHousingRepository } from "../infrastructure/housing.repository.memory.js";

function makeService() {
  const repo = new InMemoryHousingRepository();
  return { repo, service: new HousingService(repo) };
}

describe("HousingService.grantStartingResidence", () => {
  it("grants an active residence with the run-down-apartment terms (spec section 6.5)", async () => {
    const { service } = makeService();
    const playerId = "player-1" as PlayerId;
    const cityId = "city-1" as CityId;
    const nextRentDueAt = new Date("2026-08-04T00:00:00Z");

    const residence = await service.grantStartingResidence({
      playerId,
      cityId,
      residenceTypeKey: "run_down_apartment",
      residenceTypeName: "Run-Down Apartment",
      weeklyRentCents: cents(80_000),
      quality: "very_poor",
      parkingCapacity: 1,
      statusScore: 1,
      nextRentDueAt,
    });

    expect(residence.playerId).toBe(playerId);
    expect(residence.cityId).toBe(cityId);
    expect(residence.residenceTypeKey).toBe("run_down_apartment");
    expect(residence.tenancyStatus).toBe("ACTIVE");
    expect(residence.nextRentDueAt).toBe(nextRentDueAt);
  });

  it("does not create a duplicate residence type row for repeated grants of the same key", async () => {
    const { repo } = makeService();

    const firstId = await repo.ensureResidenceType({
      key: "run_down_apartment",
      name: "Run-Down Apartment",
      quality: "very_poor",
      weeklyRentCents: cents(80_000),
      parkingCapacity: 1,
      statusScore: 1,
    });
    const secondId = await repo.ensureResidenceType({
      key: "run_down_apartment",
      name: "Run-Down Apartment",
      quality: "very_poor",
      weeklyRentCents: cents(80_000),
      parkingCapacity: 1,
      statusScore: 1,
    });

    expect(secondId).toBe(firstId);
    expect(repo.residenceTypeCount()).toBe(1);
  });
});

describe("HousingService.getActiveResidence", () => {
  it("returns undefined when the player has no residence yet", async () => {
    const { service } = makeService();
    await expect(service.getActiveResidence("player-1" as PlayerId)).resolves.toBeUndefined();
  });

  it("returns the granted residence", async () => {
    const { service } = makeService();
    const playerId = "player-1" as PlayerId;
    await service.grantStartingResidence({
      playerId,
      cityId: "city-1" as CityId,
      residenceTypeKey: "run_down_apartment",
      residenceTypeName: "Run-Down Apartment",
      weeklyRentCents: cents(80_000),
      quality: "very_poor",
      parkingCapacity: 1,
      statusScore: 1,
      nextRentDueAt: new Date("2026-08-04T00:00:00Z"),
    });

    const residence = await service.getActiveResidence(playerId);
    expect(residence?.residenceTypeKey).toBe("run_down_apartment");
  });
});
