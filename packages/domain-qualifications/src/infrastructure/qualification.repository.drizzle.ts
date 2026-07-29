import { and, eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { Cents } from "@oneworld/utils";
import type { PlayerId, QualificationId } from "@oneworld/contracts";
import { asQualificationId } from "@oneworld/contracts";
import type {
  PilotHourTotals,
  PlayerQualification,
  QualificationRepository,
  QualificationType,
} from "../domain/qualification.types.js";
import {
  flightHourCategories,
  pilotHourCategoryToColumnValue,
} from "../domain/qualification.rules.js";

function toDomainPlayerQualification(
  row: typeof schema.playerQualifications.$inferSelect,
): PlayerQualification {
  return {
    playerId: row.playerId as PlayerId,
    qualificationId: row.qualificationId as QualificationId,
    awardedAt: row.awardedAt,
  };
}

/**
 * Postgres-backed `QualificationRepository`. Constructed with either the
 * real `Database` from `@oneworld/db` or a `tx` handed to a caller inside
 * `db.transaction(async (tx) => {...})` - both satisfy the same interface,
 * so `OnboardingService` composes this alongside other domains' repos in
 * one shared transaction.
 */
export class DrizzleQualificationRepository implements QualificationRepository {
  constructor(private readonly db: DbOrTx) {}

  /**
   * There's no unique constraint on `qualification_definitions.key` yet,
   * so this selects before inserting rather than relying on
   * `onConflictDoUpdate`.
   */
  async ensureQualificationDefinition(input: {
    key: string;
    name: string;
    type: QualificationType;
    tuitionCents: Cents;
    durationHours: number;
    requiresCheckFlight: boolean;
  }): Promise<QualificationId> {
    const [existing] = await this.db
      .select()
      .from(schema.qualificationDefinitions)
      .where(eq(schema.qualificationDefinitions.key, input.key));
    if (existing) {
      return asQualificationId(existing.id);
    }

    const [inserted] = await this.db
      .insert(schema.qualificationDefinitions)
      .values({
        key: input.key,
        name: input.name,
        type: input.type,
        tuitionCents: input.tuitionCents,
        durationHours: input.durationHours,
        requiresCheckFlight: input.requiresCheckFlight,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to create qualification definition: ${input.key}`);
    return asQualificationId(inserted.id);
  }

  async insertPlayerQualification(input: {
    playerId: PlayerId;
    qualificationId: QualificationId;
  }): Promise<PlayerQualification> {
    const [inserted] = await this.db
      .insert(schema.playerQualifications)
      .values({
        playerId: input.playerId,
        qualificationId: input.qualificationId,
      })
      .returning();
    if (!inserted) throw new Error("Failed to insert player qualification");
    return toDomainPlayerQualification(inserted);
  }

  /** One row per `FlightHourCategory`, matching the `pilot_hour_totals` schema shape (not one row per player). */
  async initializePilotHourTotals(playerId: PlayerId): Promise<PilotHourTotals> {
    const totals = {} as Record<keyof PilotHourTotals, number>;

    for (const category of flightHourCategories) {
      const columnValue = pilotHourCategoryToColumnValue[category];
      const [existing] = await this.db
        .select()
        .from(schema.pilotHourTotals)
        .where(
          and(
            eq(schema.pilotHourTotals.playerId, playerId),
            eq(schema.pilotHourTotals.category, columnValue),
          ),
        );

      if (existing) {
        totals[category] = existing.minutes;
        continue;
      }

      const [inserted] = await this.db
        .insert(schema.pilotHourTotals)
        .values({ playerId, category: columnValue, minutes: 0 })
        .returning();
      if (!inserted) throw new Error(`Failed to initialize pilot hour totals: ${columnValue}`);
      totals[category] = inserted.minutes;
    }

    return totals as PilotHourTotals;
  }

  async findQualification(
    playerId: PlayerId,
    qualificationKey: string,
  ): Promise<PlayerQualification | undefined> {
    const [row] = await this.db
      .select({ playerQualification: schema.playerQualifications })
      .from(schema.playerQualifications)
      .innerJoin(
        schema.qualificationDefinitions,
        eq(schema.playerQualifications.qualificationId, schema.qualificationDefinitions.id),
      )
      .where(
        and(
          eq(schema.playerQualifications.playerId, playerId),
          eq(schema.qualificationDefinitions.key, qualificationKey),
        ),
      );
    return row ? toDomainPlayerQualification(row.playerQualification) : undefined;
  }
}
