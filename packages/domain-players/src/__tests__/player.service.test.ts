import { describe, expect, it } from "vitest";
import { asAirportId, asCityId, asPlayerId } from "@oneworld/contracts";
import { PlayerService } from "../application/player.service.js";
import { InMemoryPlayerRepository } from "../infrastructure/player.repository.memory.js";

describe("PlayerService", () => {
  it("returns undefined for an unknown player", async () => {
    const service = new PlayerService(new InMemoryPlayerRepository());
    await expect(service.getProfile(asPlayerId("unknown"))).resolves.toBeUndefined();
  });

  it("finds a created profile by id and by username", async () => {
    const repo = new InMemoryPlayerRepository();
    const service = new PlayerService(repo);
    const created = await repo.insertProfile({
      authUserId: "auth-1",
      username: "pilot1",
      displayName: "Pilot One",
      companyName: "Pilot One Aviation",
      homeCityId: asCityId("city-1"),
      homeAirportId: asAirportId("KDEN"),
    });

    expect(await service.getProfile(created.id)).toEqual(created);
    expect(await service.findByUsername("pilot1")).toEqual(created);
  });
});
