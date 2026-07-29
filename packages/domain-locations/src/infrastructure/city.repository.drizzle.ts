import { and, eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { AirportId, CityId } from "@oneworld/contracts";
import type { AirportPhysicalTier } from "@oneworld/config";
import type {
  City,
  CityAirportSummary,
  CityRepository,
  EnsureCityInput,
} from "../domain/city.types.js";

function toDomainCity(row: typeof schema.cities.$inferSelect): City {
  return {
    id: row.id as CityId,
    name: row.name,
    region: row.region,
    countryCode: row.countryCode,
    latitude: row.latitude,
    longitude: row.longitude,
    employmentTier: row.employmentTier,
    enabled: row.enabled,
  };
}

/** Postgres-backed `CityRepository` (spec section 23.2). */
export class DrizzleCityRepository implements CityRepository {
  constructor(private readonly db: DbOrTx) {}

  async ensureCity(input: EnsureCityInput): Promise<City> {
    const [existing] = await this.db
      .select()
      .from(schema.cities)
      .where(
        and(
          eq(schema.cities.name, input.name),
          eq(schema.cities.region, input.region),
          eq(schema.cities.countryCode, input.countryCode),
        ),
      );
    if (existing) return toDomainCity(existing);

    const [inserted] = await this.db.insert(schema.cities).values(input).returning();
    if (!inserted) throw new Error(`Failed to create city: ${input.name}`);
    return toDomainCity(inserted);
  }

  async ensureCityAirportLink(
    cityId: CityId,
    airportIdent: string,
    isPrimary: boolean,
  ): Promise<void> {
    const [airport] = await this.db
      .select({ id: schema.airports.id })
      .from(schema.airports)
      .where(eq(schema.airports.ident, airportIdent));
    if (!airport) {
      throw new Error(`Cannot link unknown airport ident "${airportIdent}" to city ${cityId}`);
    }

    await this.db
      .insert(schema.cityAirports)
      .values({ cityId, airportId: airport.id, isPrimary })
      .onConflictDoNothing();
  }

  async listCities(): Promise<City[]> {
    const rows = await this.db.select().from(schema.cities).where(eq(schema.cities.enabled, true));
    return rows.map(toDomainCity);
  }

  async getCity(cityId: CityId): Promise<City | undefined> {
    const [row] = await this.db.select().from(schema.cities).where(eq(schema.cities.id, cityId));
    return row ? toDomainCity(row) : undefined;
  }

  async listAirportsForCity(cityId: CityId): Promise<CityAirportSummary[]> {
    const rows = await this.db
      .select({
        airportId: schema.airports.id,
        ident: schema.airports.ident,
        icao: schema.airports.icao,
        name: schema.airports.name,
        physicalTier: schema.airports.physicalTier,
        isPrimary: schema.cityAirports.isPrimary,
      })
      .from(schema.cityAirports)
      .innerJoin(schema.airports, eq(schema.cityAirports.airportId, schema.airports.id))
      .where(eq(schema.cityAirports.cityId, cityId));

    return rows.map((row) => ({
      airportId: row.airportId as AirportId,
      ident: row.ident,
      icao: row.icao ?? undefined,
      name: row.name,
      physicalTier: row.physicalTier as AirportPhysicalTier,
      isPrimary: row.isPrimary,
    }));
  }
}
