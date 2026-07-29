import type { AirportPhysicalTier } from "@oneworld/config";

/** One normalized row ready to upsert into the canonical `airports` table (spec section 12.2). */
export interface CanonicalAirportRecord {
  ident: string;
  icao?: string;
  localCode?: string;
  name: string;
  municipality?: string;
  regionCode?: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevationFt?: number;
  physicalTier: AirportPhysicalTier;
  sourceStatus: "active" | "closed" | "unverified";
  source: string;
}

/** A raw row as read from an external dataset, before normalization. */
export type RawSourceRow = Record<string, string | number | null | undefined>;

/**
 * An import adapter turns one external dataset's raw rows into canonical
 * records (spec section 12.1). Each adapter documents its source in
 * `SOURCES.md` - provenance, license, update frequency, field mapping, and
 * known data-quality limitations - before it is wired into a production
 * import job.
 */
export interface AirportImportAdapter {
  sourceId: string;
  normalize(row: RawSourceRow): CanonicalAirportRecord | undefined;
}
