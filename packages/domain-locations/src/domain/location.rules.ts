import type { AirportId } from "@oneworld/contracts";
import type { PlayerLocation } from "./location.types.js";

/**
 * A player can only begin a paid flight at the airport where they are
 * physically located (spec section 11.1, 14.2). The single implementation
 * of this check - job/travel/training code call this rather than
 * re-deriving it from raw location fields.
 */
export function isPlayerAtAirport(location: PlayerLocation, airportId: AirportId): boolean {
  return location.locationType === "AIRPORT" && location.airportId === airportId;
}

/** Location-dependent actions (start travel, start flight, apply locally) require this. */
export function canPerformLocationDependentAction(location: PlayerLocation): boolean {
  return location.locationType === "AIRPORT" || location.locationType === "CITY_RESIDENCE";
}
