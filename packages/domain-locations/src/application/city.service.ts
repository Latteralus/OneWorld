import type { CityId } from "@oneworld/contracts";
import type {
  City,
  CityAirportSummary,
  CityRepository,
  StartingCitySeed,
} from "../domain/city.types.js";

/**
 * The location domain's public read/seed path for cities (spec section
 * 24.2's ownership of "current location" extends to the city catalog it
 * points into). `seedStartingCities` is idempotent - safe to run once per
 * deploy or repeatedly from a setup script.
 */
export class CityService {
  constructor(private readonly repo: CityRepository) {}

  async seedStartingCities(cities: readonly StartingCitySeed[]): Promise<City[]> {
    const seeded: City[] = [];
    for (const city of cities) {
      const row = await this.repo.ensureCity({
        name: city.name,
        region: city.region,
        countryCode: city.countryCode,
        latitude: city.latitude,
        longitude: city.longitude,
        employmentTier: city.employmentTier,
        enabled: true,
      });
      for (const airport of city.airports) {
        await this.repo.ensureCityAirportLink(row.id, airport.ident, airport.isPrimary);
      }
      seeded.push(row);
    }
    return seeded;
  }

  async listCities(): Promise<City[]> {
    return this.repo.listCities();
  }

  async getCity(cityId: CityId): Promise<City | undefined> {
    return this.repo.getCity(cityId);
  }

  async listAirportsForCity(cityId: CityId): Promise<CityAirportSummary[]> {
    return this.repo.listAirportsForCity(cityId);
  }
}
