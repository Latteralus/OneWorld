import type { AirportPhysicalTier } from "@oneworld/config";
import type { AirportImportAdapter, CanonicalAirportRecord, RawSourceRow } from "../types.js";

/**
 * Maps the OurAirports open dataset's `type` column to OneWorld's
 * physical-tier taxonomy (spec section 12.3). OurAirports has no
 * "international hub" concept, so that tier is assigned later by a
 * scheduled-service/size heuristic, not by this adapter alone.
 */
const OUR_AIRPORTS_TYPE_TO_TIER: Record<string, AirportPhysicalTier> = {
  small_airport: "small_airfield",
  medium_airport: "local_airport",
  large_airport: "major_airport",
};

/**
 * Adapter for the OurAirports public dataset (https://ourairports.com/data/).
 * See `SOURCES.md` for license, attribution, and update-frequency notes
 * (required by spec section 12.1 before production import).
 */
export const ourAirportsAdapter: AirportImportAdapter = {
  sourceId: "our_airports",

  normalize(row: RawSourceRow): CanonicalAirportRecord | undefined {
    const type = String(row.type ?? "");
    const physicalTier = OUR_AIRPORTS_TYPE_TO_TIER[type];
    if (!physicalTier) return undefined; // heliports, seaplane bases, closed, etc. - not preview airports

    const ident = String(row.ident ?? "").trim();
    const latitude = Number(row.latitude_deg);
    const longitude = Number(row.longitude_deg);
    const countryCode = String(row.iso_country ?? "").trim();
    if (!ident || !countryCode || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return undefined;
    }

    return {
      ident,
      icao: row.icao_code ? String(row.icao_code) : undefined,
      localCode: row.local_code ? String(row.local_code) : undefined,
      name: String(row.name ?? ident),
      municipality: row.municipality ? String(row.municipality) : undefined,
      regionCode: row.iso_region ? String(row.iso_region) : undefined,
      countryCode,
      latitude,
      longitude,
      elevationFt: row.elevation_ft ? Number(row.elevation_ft) : undefined,
      physicalTier,
      sourceStatus: row.type === "closed" ? "closed" : "active",
      source: "our_airports",
    };
  },
};
