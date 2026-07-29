import { eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import { asAirportId, asCityId, asPlayerId, type PlayerId } from "@oneworld/contracts";
import type { CreatePlayerInput, PlayerProfile, PlayerRepository } from "../domain/player.types.js";

function toDomainProfile(row: typeof schema.profiles.$inferSelect): PlayerProfile {
  if (!row.homeCityId || !row.homeAirportId) {
    throw new Error(`profiles row ${row.id} missing homeCityId/homeAirportId`);
  }
  return {
    id: asPlayerId(row.id),
    username: row.username,
    displayName: row.displayName,
    companyName: row.companyName,
    homeCityId: asCityId(row.homeCityId),
    homeAirportId: asAirportId(row.homeAirportId),
    createdAt: row.createdAt,
  };
}

/** Postgres-backed `PlayerRepository` (spec section 23.1). `profiles.id` is the Supabase Auth user id. */
export class DrizzlePlayerRepository implements PlayerRepository {
  constructor(private readonly db: DbOrTx) {}

  async findById(playerId: PlayerId): Promise<PlayerProfile | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, playerId));
    return row ? toDomainProfile(row) : undefined;
  }

  async findByUsername(username: string): Promise<PlayerProfile | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username));
    return row ? toDomainProfile(row) : undefined;
  }

  async insertProfile(input: CreatePlayerInput): Promise<PlayerProfile> {
    const [row] = await this.db
      .insert(schema.profiles)
      .values({
        id: input.authUserId,
        username: input.username,
        displayName: input.displayName,
        companyName: input.companyName,
        homeCityId: input.homeCityId,
        homeAirportId: input.homeAirportId,
        currentLocationType: "CITY_RESIDENCE",
      })
      .returning();

    if (!row) throw new Error(`Failed to create profile for ${input.authUserId}`);
    return toDomainProfile(row);
  }
}
