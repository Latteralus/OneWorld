import type { PlayerId } from "@oneworld/contracts";
import type { LocationRepository, PlayerLocation } from "../domain/location.types.js";

/** In-memory `LocationRepository` for unit tests. */
export class InMemoryLocationRepository implements LocationRepository {
  private readonly locations = new Map<string, PlayerLocation>();

  async getLocation(playerId: PlayerId): Promise<PlayerLocation | undefined> {
    return this.locations.get(playerId);
  }

  async setLocation(location: PlayerLocation): Promise<PlayerLocation> {
    this.locations.set(location.playerId, location);
    return location;
  }
}
