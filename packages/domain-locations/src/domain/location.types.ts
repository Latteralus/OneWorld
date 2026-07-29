import type { AirportId, CityId, GroundTravelId, PlayerId } from "@oneworld/contracts";
import type { PlayerLocationType } from "@oneworld/contracts";

/**
 * A player's single persistent location record (spec section 11.1, 23.2).
 * Exactly one of `cityId`/`airportId`/`activeTravelId`/`activeFlightId` is
 * populated depending on `locationType` - enforce this with a DB check
 * constraint in the migration, and with the type union below at compile time.
 */
export type PlayerLocation =
  | { playerId: PlayerId; locationType: "CITY_RESIDENCE"; cityId: CityId }
  | { playerId: PlayerId; locationType: "AIRPORT"; airportId: AirportId }
  | { playerId: PlayerId; locationType: "IN_GROUND_TRANSIT"; activeTravelId: GroundTravelId }
  | { playerId: PlayerId; locationType: "IN_SIMULATOR_FLIGHT"; activeFlightId: string };

export type { PlayerLocationType };
