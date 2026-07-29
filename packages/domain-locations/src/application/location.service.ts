import type { PlayerId } from "@oneworld/contracts";
import type { LocationRepository, PlayerLocation } from "../domain/location.types.js";

/**
 * The location domain's public read/write path for a player's current
 * location (spec section 24.2's ownership matrix, 21.2). Other domains
 * (travel, flights) call this rather than writing `player_locations`
 * directly (section 24.1 service boundary rule).
 */
export class LocationService {
  constructor(private readonly repo: LocationRepository) {}

  async getLocation(playerId: PlayerId): Promise<PlayerLocation | undefined> {
    return this.repo.getLocation(playerId);
  }

  async setLocation(location: PlayerLocation): Promise<PlayerLocation> {
    return this.repo.setLocation(location);
  }
}
