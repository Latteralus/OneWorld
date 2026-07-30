import { describe, expect, it } from "vitest";
import { fixtureAirports } from "@oneworld/testing";
import type { AirportId, PlayerId } from "@oneworld/contracts";
import { TravelService } from "../application/travel.service.js";
import { InMemoryTravelRepository } from "../infrastructure/travel.repository.memory.js";
import type { TravelEndpoint } from "../domain/travel.types.js";

const [kboi, kmyl] = fixtureAirports;
const kboiId = "airport-kboi" as AirportId;
const kmylId = "airport-kmyl" as AirportId;
const origin: TravelEndpoint = { type: "airport", airportId: kboiId, point: kboi };
const destination: TravelEndpoint = { type: "airport", airportId: kmylId, point: kmyl };
const playerId = "player-1" as PlayerId;

function makeService() {
  const repo = new InMemoryTravelRepository();
  return { repo, service: new TravelService(repo) };
}

describe("TravelService.quoteTravel", () => {
  it("rejects a quote where origin and destination are the same", () => {
    const { service } = makeService();
    expect.assertions(1);
    try {
      service.quoteTravel({ mode: "bus", origin, destination: origin });
    } catch (error) {
      expect(error).toMatchObject({ code: "ORIGIN_DESTINATION_SAME" });
    }
  });

  it("quotes bus travel", () => {
    const { service } = makeService();
    const quote = service.quoteTravel({ mode: "bus", origin, destination });
    expect(quote.mode).toBe("bus");
    expect(quote.costCents).toBeGreaterThan(0);
  });
});

describe("TravelService.startTravel / getActiveTravel", () => {
  it("creates a TRAVELING record with a computed arrivesAt", async () => {
    const { service } = makeService();
    const now = new Date("2026-07-28T12:00:00Z");
    const quote = service.quoteTravel({ mode: "bus", origin, destination });

    const travel = await service.startTravel({ playerId, mode: "bus", origin, destination, now, quote });

    expect(travel.status).toBe("TRAVELING");
    expect(travel.departedAt).toEqual(now);
    expect(travel.arrivesAt.getTime()).toBe(new Date(now.getTime() + quote.durationMinutes * 60_000).getTime());
    expect(travel.origin).toEqual({ type: "airport", airportId: kboiId });
    expect(travel.destination).toEqual({ type: "airport", airportId: kmylId });

    const active = await service.getActiveTravel(playerId);
    expect(active?.id).toBe(travel.id);
  });

  it("rejects starting a second trip while one is already active", async () => {
    const { service } = makeService();
    const now = new Date("2026-07-28T12:00:00Z");
    const quote = service.quoteTravel({ mode: "bus", origin, destination });
    await service.startTravel({ playerId, mode: "bus", origin, destination, now, quote });

    await expect(
      service.startTravel({ playerId, mode: "bus", origin, destination, now, quote }),
    ).rejects.toMatchObject({ code: "TRAVEL_ALREADY_ACTIVE" });
  });
});

describe("TravelService.completeDueTravel", () => {
  it("marks ARRIVED only travel whose arrivesAt has passed, leaving the rest TRAVELING", async () => {
    const { service } = makeService();
    const now = new Date("2026-07-28T12:00:00Z");
    const quote = service.quoteTravel({ mode: "bus", origin, destination });
    const travel = await service.startTravel({ playerId, mode: "bus", origin, destination, now, quote });

    const beforeArrival = new Date(travel.arrivesAt.getTime() - 1_000);
    expect(await service.completeDueTravel(beforeArrival)).toHaveLength(0);
    expect((await service.getById(travel.id))?.status).toBe("TRAVELING");

    const completed = await service.completeDueTravel(travel.arrivesAt);
    expect(completed).toHaveLength(1);
    expect(completed[0]?.id).toBe(travel.id);
    expect((await service.getById(travel.id))?.status).toBe("ARRIVED");

    // Once arrived, the player is free to start new travel again.
    await expect(service.getActiveTravel(playerId)).resolves.toBeUndefined();
  });
});
