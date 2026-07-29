import { and, eq, lte, ne } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { Cents } from "@oneworld/utils";
import type { CityId, PlayerId, ResidenceId } from "@oneworld/contracts";
import type { HousingRepository, PlayerResidence } from "../domain/housing.types.js";

function toDomainResidence(
  row: typeof schema.playerResidences.$inferSelect,
  residenceTypeKey: string,
  weeklyRentCents: Cents,
): PlayerResidence {
  return {
    id: row.id as ResidenceId,
    playerId: row.playerId as PlayerId,
    residenceTypeKey,
    weeklyRentCents,
    cityId: row.cityId as CityId,
    tenancyStatus: row.tenancyStatus,
    nextRentDueAt: row.nextRentDueAt,
    graceDeadlineAt: row.graceDeadlineAt ?? undefined,
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
    weeklyRentCents: Cents;
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
    return toDomainResidence(inserted, input.residenceTypeKey, input.weeklyRentCents);
  }

  async findActiveResidenceForPlayer(playerId: PlayerId): Promise<PlayerResidence | undefined> {
    const [row] = await this.db
      .select({
        residence: schema.playerResidences,
        residenceTypeKey: schema.residenceTypes.key,
        weeklyRentCents: schema.residenceTypes.weeklyRentCents,
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
    return row
      ? toDomainResidence(row.residence, row.residenceTypeKey, row.weeklyRentCents as Cents)
      : undefined;
  }

  async listResidencesDueForRentSweep(now: Date): Promise<PlayerResidence[]> {
    const rows = await this.db
      .select({
        residence: schema.playerResidences,
        residenceTypeKey: schema.residenceTypes.key,
        weeklyRentCents: schema.residenceTypes.weeklyRentCents,
      })
      .from(schema.playerResidences)
      .innerJoin(
        schema.residenceTypes,
        eq(schema.playerResidences.residenceTypeId, schema.residenceTypes.id),
      )
      .where(
        and(
          ne(schema.playerResidences.tenancyStatus, "UNHOUSED"),
          lte(schema.playerResidences.nextRentDueAt, now),
        ),
      );
    return rows.map((row) => toDomainResidence(row.residence, row.residenceTypeKey, row.weeklyRentCents as Cents));
  }

  async updateTenancyOutcome(
    residenceId: ResidenceId,
    input: { tenancyStatus: string; nextRentDueAt: Date; graceDeadlineAt: Date | undefined },
  ): Promise<PlayerResidence> {
    const [updated] = await this.db
      .update(schema.playerResidences)
      .set({
        tenancyStatus: input.tenancyStatus,
        nextRentDueAt: input.nextRentDueAt,
        graceDeadlineAt: input.graceDeadlineAt ?? null,
      })
      .where(eq(schema.playerResidences.id, residenceId))
      .returning();
    if (!updated) throw new Error(`Unknown residence: ${residenceId}`);

    const [residenceType] = await this.db
      .select({ key: schema.residenceTypes.key, weeklyRentCents: schema.residenceTypes.weeklyRentCents })
      .from(schema.residenceTypes)
      .where(eq(schema.residenceTypes.id, updated.residenceTypeId));
    if (!residenceType) throw new Error(`Unknown residence type: ${updated.residenceTypeId}`);

    return toDomainResidence(updated, residenceType.key, residenceType.weeklyRentCents as Cents);
  }
}
