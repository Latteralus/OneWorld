import type { AirportId } from "@oneworld/contracts";
import { isPreviewEligible } from "./preview.js";
import type { AirportImportAdapter, CanonicalAirportRecord, RawSourceRow } from "./types.js";

export interface AirportImportSink {
  /** Upserts one airport into the canonical catalog and returns its id. */
  upsertAirport(record: CanonicalAirportRecord, previewEnabled: boolean): Promise<AirportId>;
  /** Ensures game-state exists for a preview-enabled airport (idempotent). */
  ensureGameState(
    airportId: AirportId,
    physicalTier: CanonicalAirportRecord["physicalTier"],
  ): Promise<void>;
}

export interface AirportImportSummary {
  totalRows: number;
  normalized: number;
  skippedUnmapped: number;
  previewEnabled: number;
}

/**
 * Orchestrates one import run: normalize each raw row through the adapter,
 * skip rows the adapter can't map (spec section 12.1), decide preview
 * eligibility, and upsert. Safe to run repeatedly - every write is an
 * upsert/ensure, never a duplicate insert (spec section 25.2).
 */
export async function runAirportImport(
  rows: RawSourceRow[],
  adapter: AirportImportAdapter,
  sink: AirportImportSink,
): Promise<AirportImportSummary> {
  const summary: AirportImportSummary = {
    totalRows: rows.length,
    normalized: 0,
    skippedUnmapped: 0,
    previewEnabled: 0,
  };

  for (const row of rows) {
    const record = adapter.normalize(row);
    if (!record) {
      summary.skippedUnmapped += 1;
      continue;
    }
    summary.normalized += 1;

    const previewEnabled = isPreviewEligible(record);
    if (previewEnabled) summary.previewEnabled += 1;

    const airportId = await sink.upsertAirport(record, previewEnabled);
    if (previewEnabled) {
      await sink.ensureGameState(airportId, record.physicalTier);
    }
  }

  return summary;
}
