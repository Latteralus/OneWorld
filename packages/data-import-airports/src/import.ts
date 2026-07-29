import type { AirportId } from "@oneworld/contracts";
import { isPreviewEligible } from "./preview.js";
import type { AirportImportAdapter, CanonicalAirportRecord, RawSourceRow } from "./types.js";

/** Rows per round trip. Large enough to matter, small enough to stay well under Postgres's per-statement parameter limit. */
const BATCH_SIZE = 500;

export interface AirportImportSink {
  /** Upserts a batch of airports into the canonical catalog; returns each row's id keyed by `ident`. */
  upsertAirports(
    records: Array<{ record: CanonicalAirportRecord; previewEnabled: boolean }>,
  ): Promise<Map<string, AirportId>>;
  /** Ensures game-state exists for a batch of preview-enabled airports (idempotent). */
  ensureGameStates(
    inputs: Array<{ airportId: AirportId; physicalTier: CanonicalAirportRecord["physicalTier"] }>,
  ): Promise<void>;
}

export interface AirportImportSummary {
  totalRows: number;
  normalized: number;
  skippedUnmapped: number;
  previewEnabled: number;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Orchestrates one import run: normalize each raw row through the adapter,
 * skip rows the adapter can't map (spec section 12.1), decide preview
 * eligibility, and upsert in batches (spec section 25.2: no unbounded
 * per-row round trips - a real-world run is tens of thousands of rows).
 * Safe to run repeatedly - every write is an upsert/ensure, never a
 * duplicate insert.
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

  const normalized: Array<{ record: CanonicalAirportRecord; previewEnabled: boolean }> = [];
  for (const row of rows) {
    const record = adapter.normalize(row);
    if (!record) {
      summary.skippedUnmapped += 1;
      continue;
    }
    summary.normalized += 1;

    const previewEnabled = isPreviewEligible(record);
    if (previewEnabled) summary.previewEnabled += 1;
    normalized.push({ record, previewEnabled });
  }

  for (const batch of chunk(normalized, BATCH_SIZE)) {
    const idByIdent = await sink.upsertAirports(batch);

    const gameStateInputs = batch
      .filter((entry) => entry.previewEnabled)
      .map((entry) => {
        const airportId = idByIdent.get(entry.record.ident);
        if (!airportId) {
          throw new Error(`Upsert did not return an id for airport ident "${entry.record.ident}"`);
        }
        return { airportId, physicalTier: entry.record.physicalTier };
      });

    if (gameStateInputs.length > 0) {
      await sink.ensureGameStates(gameStateInputs);
    }
  }

  return summary;
}
