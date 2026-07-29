import { eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import { asAirportId, asCityId, asGroundTravelId, asPlayerId } from "@oneworld/contracts";
import type { PlayerId } from "@oneworld/contracts";
import type { LocationRepository, PlayerLocation } from "../domain/location.types.js";

function toDomainLocation(row: typeof schema.playerLocations.$inferSelect): PlayerLocation {
  const playerId = asPlayerId(row.playerId);
  switch (row.locationType) {
    case "CITY_RESIDENCE":
      if (!row.cityId) throw new Error(`player_locations row ${row.playerId} missing cityId`);
      return { playerId, locationType: "CITY_RESIDENCE", cityId: asCityId(row.cityId) };
    case "AIRPORT":
      if (!row.airportId) throw new Error(`player_locations row ${row.playerId} missing airportId`);
      return { playerId, locationType: "AIRPORT", airportId: asAirportId(row.airportId) };
    case "IN_GROUND_TRANSIT":
      if (!row.activeTravelId) {
        throw new Error(`player_locations row ${row.playerId} missing activeTravelId`);
      }
      return {
        playerId,
        locationType: "IN_GROUND_TRANSIT",
        activeTravelId: asGroundTravelId(row.activeTravelId),
      };
    case "IN_SIMULATOR_FLIGHT":
      if (!row.activeFlightId) {
        throw new Error(`player_locations row ${row.playerId} missing activeFlightId`);
      }
      return { playerId, locationType: "IN_SIMULATOR_FLIGHT", activeFlightId: row.activeFlightId };
    default:
      throw new Error(`Unknown location_type: ${row.locationType}`);
  }
}

/** Row values for each `PlayerLocation` variant - only the field valid for that type is set. */
function toRowValues(location: PlayerLocation) {
  return {
    playerId: location.playerId,
    locationType: location.locationType,
    cityId: location.locationType === "CITY_RESIDENCE" ? location.cityId : null,
    airportId: location.locationType === "AIRPORT" ? location.airportId : null,
    activeTravelId: location.locationType === "IN_GROUND_TRANSIT" ? location.activeTravelId : null,
    activeFlightId:
      location.locationType === "IN_SIMULATOR_FLIGHT" ? location.activeFlightId : null,
  };
}

/** Postgres-backed `LocationRepository` (spec section 23.2). One row per player, upserted in place. */
export class DrizzleLocationRepository implements LocationRepository {
  constructor(private readonly db: DbOrTx) {}

  async getLocation(playerId: PlayerId): Promise<PlayerLocation | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.playerLocations)
      .where(eq(schema.playerLocations.playerId, playerId));
    return row ? toDomainLocation(row) : undefined;
  }

  async setLocation(location: PlayerLocation): Promise<PlayerLocation> {
    const values = toRowValues(location);
    await this.db
      .insert(schema.playerLocations)
      .values(values)
      .onConflictDoUpdate({ target: schema.playerLocations.playerId, set: values });
    return location;
  }
}
