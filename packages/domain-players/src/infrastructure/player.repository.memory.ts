import { asPlayerId, type PlayerId } from "@oneworld/contracts";
import type { CreatePlayerInput, PlayerProfile, PlayerRepository } from "../domain/player.types.js";

/** In-memory `PlayerRepository` for unit tests. */
export class InMemoryPlayerRepository implements PlayerRepository {
  private readonly profilesById = new Map<string, PlayerProfile>();

  async findById(playerId: PlayerId): Promise<PlayerProfile | undefined> {
    return this.profilesById.get(playerId);
  }

  async findByUsername(username: string): Promise<PlayerProfile | undefined> {
    return [...this.profilesById.values()].find((profile) => profile.username === username);
  }

  async insertProfile(input: CreatePlayerInput): Promise<PlayerProfile> {
    const profile: PlayerProfile = {
      id: asPlayerId(input.authUserId),
      username: input.username,
      displayName: input.displayName,
      companyName: input.companyName,
      homeCityId: input.homeCityId,
      homeAirportId: input.homeAirportId,
      createdAt: new Date(),
    };
    this.profilesById.set(profile.id, profile);
    return profile;
  }
}
