import type { AirportId } from "@oneworld/contracts";
import type { AirportActivityClass, AirportPhysicalTier } from "@oneworld/config";

/** One airport as shown in the browser/map/detail page (spec section 12.4, 26.4). */
export interface AirportSummary {
  id: AirportId;
  ident: string;
  icao: string | undefined;
  localCode: string | undefined;
  name: string;
  municipality: string | undefined;
  regionCode: string | undefined;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevationFt: number | undefined;
  physicalTier: AirportPhysicalTier;
  previewEnabled: boolean;
  activityScore: number;
  activityClass: AirportActivityClass;
}

/** An airport paired with its distance from a search origin (nautical miles). */
export interface AirportWithDistance extends AirportSummary {
  distanceNm: number;
}

/** Search/filter inputs for the airport browser (spec section 26.4). Only preview-enabled airports are returned. */
export interface AirportSearchFilters {
  /** Matches ident, ICAO, name, or municipality (case-insensitive substring). */
  query?: string;
  countryCode?: string;
  physicalTier?: AirportPhysicalTier;
  near?: { latitude: number; longitude: number; maxDistanceNm: number };
  limit?: number;
}

export interface EnsureGameStateInput {
  airportId: AirportId;
  physicalTier: AirportPhysicalTier;
}

/**
 * Repository interface owned by this domain (spec section 20.4). Reads the
 * canonical `airports` table (owned/written by `@oneworld/data-import-airports`
 * per that package's README) to serve search/browse/detail queries, and
 * owns all reads and writes of `airport_game_state` (spec section 21.2).
 */
export interface AirportRepository {
  /** Creates a zeroed game-state row for a newly-imported airport if one doesn't already exist. */
  ensureGameState(input: EnsureGameStateInput): Promise<void>;
  search(filters: AirportSearchFilters): Promise<AirportSummary[]>;
  getById(airportId: AirportId): Promise<AirportSummary | undefined>;
  /** Airports within `maxDistanceNm` of a point, nearest first, excluding `excludeAirportId` if given. */
  listNearby(
    point: { latitude: number; longitude: number },
    maxDistanceNm: number,
    limit: number,
    excludeAirportId?: AirportId,
  ): Promise<AirportWithDistance[]>;
}
