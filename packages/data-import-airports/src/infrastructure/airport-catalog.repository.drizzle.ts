import { sql } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { AirportId } from "@oneworld/contracts";
import type { CanonicalAirportRecord } from "../types.js";

/**
 * Writes the canonical `airports` table (owned by this package per its
 * README - the import job is the one writer of airport *identity*;
 * `@oneworld/domain-airports` owns `airport_game_state` layered on top).
 * Upserts on `ident`, which has a unique index (`airports_ident_idx`).
 */
export class DrizzleAirportCatalogRepository {
  constructor(private readonly db: DbOrTx) {}

  /**
   * Batched upsert - one round trip for many airports rather than one per
   * row (a real-world import is ~48k rows; row-by-row upserts over a
   * network connection took hours, see the change log). Returns each
   * upserted row's id keyed by `ident` rather than relying on `RETURNING`
   * preserving input order, which Postgres doesn't guarantee.
   */
  async upsertAirports(
    records: Array<{ record: CanonicalAirportRecord; previewEnabled: boolean }>,
  ): Promise<Map<string, AirportId>> {
    if (records.length === 0) return new Map();

    const rows = await this.db
      .insert(schema.airports)
      .values(
        records.map(({ record, previewEnabled }) => ({
          ident: record.ident,
          icao: record.icao,
          localCode: record.localCode,
          name: record.name,
          municipality: record.municipality,
          regionCode: record.regionCode,
          countryCode: record.countryCode,
          latitude: record.latitude,
          longitude: record.longitude,
          elevationFt: record.elevationFt,
          physicalTier: record.physicalTier,
          sourceStatus: record.sourceStatus,
          previewEnabled,
        })),
      )
      .onConflictDoUpdate({
        target: schema.airports.ident,
        set: {
          icao: sql`excluded.icao`,
          localCode: sql`excluded.local_code`,
          name: sql`excluded.name`,
          municipality: sql`excluded.municipality`,
          regionCode: sql`excluded.region_code`,
          countryCode: sql`excluded.country_code`,
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
          elevationFt: sql`excluded.elevation_ft`,
          physicalTier: sql`excluded.physical_tier`,
          sourceStatus: sql`excluded.source_status`,
          previewEnabled: sql`excluded.preview_enabled`,
          updatedAt: new Date(),
        },
      })
      .returning({ id: schema.airports.id, ident: schema.airports.ident });

    return new Map(rows.map((row) => [row.ident, row.id as AirportId]));
  }
}
