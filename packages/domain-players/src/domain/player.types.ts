import type { AirportId, CityId, PlayerId } from "@oneworld/contracts";

/** Player profile identity (spec section 6.1, 23.1). */
export interface PlayerProfile {
  id: PlayerId;
  username: string;
  displayName: string;
  companyName: string;
  homeCityId: CityId;
  homeAirportId: AirportId;
  createdAt: Date;
}

/** Input captured during character creation (spec section 6.1). */
export interface CreatePlayerInput {
  authUserId: string;
  username: string;
  displayName: string;
  companyName: string;
  homeCityId: CityId;
  homeAirportId: AirportId;
}

/**
 * Repository interface owned by this domain (spec section 20.4).
 * `profiles.id` matches the Supabase Auth user id (section 23.1) - it is
 * never a separately-minted id, so `findById` takes the auth user id.
 */
export interface PlayerRepository {
  findById(playerId: PlayerId): Promise<PlayerProfile | undefined>;
  findByUsername(username: string): Promise<PlayerProfile | undefined>;
  insertProfile(input: CreatePlayerInput): Promise<PlayerProfile>;
}
