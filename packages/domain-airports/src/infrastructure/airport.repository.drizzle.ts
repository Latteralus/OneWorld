import { and, eq, ilike, or } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import { calculateGreatCircleDistanceNm, type GeoPoint } from "@oneworld/utils";
import type { AirportId } from "@oneworld/contracts";
import type { AirportActivityClass, AirportPhysicalTier } from "@oneworld/config";
import { calculateAirportPassengerTarget } from "../domain/airport.rules.js";
import type {
  AirportRepository,
  AirportSearchFilters,
  AirportSummary,
  AirportWithDistance,
  EnsureGameStateInput,
} from "../domain/catalog.types.js";

/** Upper bound on rows fetched before in-process distance filtering (spec section 25.2: no unbounded scans). */
const CANDIDATE_ROW_LIMIT = 3000;
const DEFAULT_SEARCH_LIMIT = 50;

type CatalogRow = {
  id: string;
  ident: string;
  icao: string | null;
  localCode: string | null;
  name: string;
  municipality: string | null;
  regionCode: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevationFt: number | null;
  physicalTier: string;
  previewEnabled: boolean;
  activityScore: number | null;
  activityClass: string | null;
};

function toSummary(row: CatalogRow): AirportSummary {
  return {
    id: row.id as AirportId,
    ident: row.ident,
    icao: row.icao ?? undefined,
    localCode: row.localCode ?? undefined,
    name: row.name,
    municipality: row.municipality ?? undefined,
    regionCode: row.regionCode ?? undefined,
    countryCode: row.countryCode,
    latitude: row.latitude,
    longitude: row.longitude,
    elevationFt: row.elevationFt ?? undefined,
    physicalTier: row.physicalTier as AirportPhysicalTier,
    previewEnabled: row.previewEnabled,
    activityScore: row.activityScore ?? 0,
    activityClass: (row.activityClass ?? "quiet") as AirportActivityClass,
  };
}

/** Postgres-backed `AirportRepository` (spec section 12, 15). */
export class DrizzleAirportRepository implements AirportRepository {
  constructor(private readonly db: DbOrTx) {}

  async ensureGameState(input: EnsureGameStateInput): Promise<void> {
    const basePassengerTarget = calculateAirportPassengerTarget(input.physicalTier, "quiet");
    await this.db
      .insert(schema.airportGameState)
      .values({
        airportId: input.airportId,
        activityScore: 0,
        activityClass: "quiet",
        basePassengerTarget,
      })
      .onConflictDoNothing();
  }

  private baseQuery() {
    return this.db
      .select({
        id: schema.airports.id,
        ident: schema.airports.ident,
        icao: schema.airports.icao,
        localCode: schema.airports.localCode,
        name: schema.airports.name,
        municipality: schema.airports.municipality,
        regionCode: schema.airports.regionCode,
        countryCode: schema.airports.countryCode,
        latitude: schema.airports.latitude,
        longitude: schema.airports.longitude,
        elevationFt: schema.airports.elevationFt,
        physicalTier: schema.airports.physicalTier,
        previewEnabled: schema.airports.previewEnabled,
        activityScore: schema.airportGameState.activityScore,
        activityClass: schema.airportGameState.activityClass,
      })
      .from(schema.airports)
      .leftJoin(schema.airportGameState, eq(schema.airportGameState.airportId, schema.airports.id));
  }

  async search(filters: AirportSearchFilters): Promise<AirportSummary[]> {
    const conditions = [eq(schema.airports.previewEnabled, true)];
    if (filters.query) {
      const pattern = `%${filters.query}%`;
      const clause = or(
        ilike(schema.airports.ident, pattern),
        ilike(schema.airports.icao, pattern),
        ilike(schema.airports.name, pattern),
        ilike(schema.airports.municipality, pattern),
      );
      if (clause) conditions.push(clause);
    }
    if (filters.countryCode) conditions.push(eq(schema.airports.countryCode, filters.countryCode));
    if (filters.physicalTier)
      conditions.push(eq(schema.airports.physicalTier, filters.physicalTier));

    const rows = await this.baseQuery()
      .where(and(...conditions))
      .limit(CANDIDATE_ROW_LIMIT);

    let summaries = rows.map(toSummary);

    if (filters.near) {
      const origin = filters.near;
      summaries = summaries.filter(
        (airport) => calculateGreatCircleDistanceNm(origin, airport) <= origin.maxDistanceNm,
      );
    }

    return summaries.slice(0, filters.limit ?? DEFAULT_SEARCH_LIMIT);
  }

  async getById(airportId: AirportId): Promise<AirportSummary | undefined> {
    const [row] = await this.baseQuery().where(eq(schema.airports.id, airportId));
    return row ? toSummary(row) : undefined;
  }

  async listNearby(
    point: GeoPoint,
    maxDistanceNm: number,
    limit: number,
    excludeAirportId?: AirportId,
  ): Promise<AirportWithDistance[]> {
    const rows = await this.baseQuery()
      .where(eq(schema.airports.previewEnabled, true))
      .limit(CANDIDATE_ROW_LIMIT);

    return rows
      .map(toSummary)
      .filter((airport) => airport.id !== excludeAirportId)
      .map((airport) => ({
        ...airport,
        distanceNm: calculateGreatCircleDistanceNm(point, airport),
      }))
      .filter((airport) => airport.distanceNm <= maxDistanceNm)
      .sort((a, b) => a.distanceNm - b.distanceNm)
      .slice(0, limit);
  }
}
