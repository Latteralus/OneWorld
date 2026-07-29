import { describe, expect, it } from "vitest";
import { asAirportId, asCityId, asGroundTravelId, asPlayerId } from "@oneworld/contracts";
import { canPerformLocationDependentAction, isPlayerAtAirport } from "../domain/location.rules.js";
import type { PlayerLocation } from "../domain/location.types.js";

const playerId = asPlayerId("player-1");
const kboi = asAirportId("KBOI");
const kmyl = asAirportId("KMYL");

describe("isPlayerAtAirport", () => {
  it("is true only when the player is at that exact airport", () => {
    const location: PlayerLocation = { playerId, locationType: "AIRPORT", airportId: kboi };
    expect(isPlayerAtAirport(location, kboi)).toBe(true);
    expect(isPlayerAtAirport(location, kmyl)).toBe(false);
  });

  it("is false while the player is in transit (spec section 11.1)", () => {
    const location: PlayerLocation = {
      playerId,
      locationType: "IN_GROUND_TRANSIT",
      activeTravelId: asGroundTravelId("travel-1"),
    };
    expect(isPlayerAtAirport(location, kboi)).toBe(false);
  });
});

describe("canPerformLocationDependentAction", () => {
  it("allows actions at an airport or city residence", () => {
    expect(
      canPerformLocationDependentAction({ playerId, locationType: "AIRPORT", airportId: kboi }),
    ).toBe(true);
    expect(
      canPerformLocationDependentAction({
        playerId,
        locationType: "CITY_RESIDENCE",
        cityId: asCityId("city-1"),
      }),
    ).toBe(true);
  });

  it("blocks actions while in transit or in flight (spec section 11.6)", () => {
    expect(
      canPerformLocationDependentAction({
        playerId,
        locationType: "IN_GROUND_TRANSIT",
        activeTravelId: asGroundTravelId("travel-1"),
      }),
    ).toBe(false);
  });
});
