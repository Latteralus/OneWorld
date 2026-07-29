import type { PlayerId } from "@oneworld/contracts";
import type { PlayerProfile, PlayerRepository } from "../domain/player.types.js";

/** The player domain's public read path for profile identity (spec section 24.2). */
export class PlayerService {
  constructor(private readonly repo: PlayerRepository) {}

  async getProfile(playerId: PlayerId): Promise<PlayerProfile | undefined> {
    return this.repo.findById(playerId);
  }

  async findByUsername(username: string): Promise<PlayerProfile | undefined> {
    return this.repo.findByUsername(username);
  }
}
