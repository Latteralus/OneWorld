import { and, eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { Cents } from "@oneworld/utils";
import type { CityId, PlayerId, ResidenceId } from "@oneworld/contracts";
import type { HousingRepository, PlayerResidence } from "../domain/housing.types.js";

function toDomainResidence(
  row: typeof schema.playerResidences.$inferSelect,
  residenceTypeKey: string,
): PlayerResidence {
  return {
    id: row.id as ResidenceId,
    playerId: row.playerId as PlayerId,
    residenceTypeKey,
    cityId: row.cityId as CityId,
    tenancyStatus: row.tenancyStatus,
    nextRentDueAt: row.nextRentDueAt,
  };
}

/** Postgres-backed `HousingRepository`. */
export class DrizzleHousingRepository implements HousingRepository {
  constructor(private readonly db: DbOrTx) {}

  /**
   * `residence_types.key` has no unique constraint in the schema yet, so
   * this is a plain select-then-insert-if-absent rather than
   * `onConflictDoNothing`.
   */
  async ensureResidenceType(input: {
    key: string;
    name: string;
    quality: string;
    weeklyRentCents: Cents;
    parkingCapacity: number;
    statusScore: number;
  }): Promise<string> {
    const [existing] = await this.db
      .select()
      .from(schema.residenceTypes)
      .where(eq(schema.residenceTypes.key, input.key));
    if (existing) return existing.id;

    const [inserted] = await this.db
      .insert(schema.residenceTypes)
      .values({
        key: input.key,
        name: input.name,
        quality: input.quality,
        weeklyRentCents: input.weeklyRentCents,
        parkingCapacity: input.parkingCapacity,
        statusScore: input.statusScore,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to create residence type: ${input.key}`);
    return inserted.id;
  }

  async insertPlayerResidence(input: {
    playerId: PlayerId;
    residenceTypeId: string;
    residenceTypeKey: string;
    cityId: CityId;
    tenancyStatus: string;
    nextRentDueAt: Date;
  }): Promise<PlayerResidence> {
    const [inserted] = await this.db
      .insert(schema.playerResidences)
      .values({
        playerId: input.playerId,
        residenceTypeId: input.residenceTypeId,
        cityId: input.cityId,
        tenancyStatus: input.tenancyStatus,
        nextRentDueAt: input.nextRentDueAt,
      })
      .returning();
    if (!inserted) throw new Error("Failed to insert player residence");
    return toDomainResidence(inserted, input.residenceTypeKey);
  }

  async findActiveResidenceForPlayer(playerId: PlayerId): Promise<PlayerResidence | undefined> {
    const [row] = await this.db
      .select({
        residence: schema.playerResidences,
        residenceTypeKey: schema.residenceTypes.key,
      })
      .from(schema.playerResidences)
      .innerJoin(
        schema.residenceTypes,
        eq(schema.playerResidences.residenceTypeId, schema.residenceTypes.id),
      )
      .where(
        and(
          eq(schema.playerResidences.playerId, playerId),
          eq(schema.playerResidences.tenancyStatus, "ACTIVE"),
        ),
      );
    return row ? toDomainResidence(row.residence, row.residenceTypeKey) : undefined;
  }
}
