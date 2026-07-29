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

  async upsertAirport(record: CanonicalAirportRecord, previewEnabled: boolean): Promise<AirportId> {
    const values = {
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
    };

    const [row] = await this.db
      .insert(schema.airports)
      .values(values)
      .onConflictDoUpdate({
        target: schema.airports.ident,
        set: { ...values, updatedAt: new Date() },
      })
      .returning({ id: schema.airports.id });

    if (!row) throw new Error(`Failed to upsert airport: ${record.ident}`);
    return row.id as AirportId;
  }
}
