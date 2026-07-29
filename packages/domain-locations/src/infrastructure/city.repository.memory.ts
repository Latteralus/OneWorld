import { asAirportId, asCityId, type AirportId, type CityId } from "@oneworld/contracts";
import type {
  City,
  CityAirportSummary,
  CityRepository,
  EnsureCityInput,
} from "../domain/city.types.js";

let sequence = 0;
function nextId(): string {
  sequence += 1;
  return `mem-city-${sequence}`;
}

/** In-memory `CityRepository` for unit tests. Seed known airport idents via `seedAirportIdent`. */
export class InMemoryCityRepository implements CityRepository {
  private readonly cities = new Map<string, City>();
  private readonly links = new Map<string, CityAirportSummary[]>();
  private readonly knownAirports = new Map<
    string,
    { airportId: AirportId; name: string; physicalTier: CityAirportSummary["physicalTier"] }
  >();

  seedAirportIdent(
    ident: string,
    airport: { name: string; physicalTier: CityAirportSummary["physicalTier"] },
  ): AirportId {
    const airportId = asAirportId(ident);
    this.knownAirports.set(ident, { airportId, ...airport });
    return airportId;
  }

  async ensureCity(input: EnsureCityInput): Promise<City> {
    const existing = [...this.cities.values()].find(
      (city) =>
        city.name === input.name &&
        city.region === input.region &&
        city.countryCode === input.countryCode,
    );
    if (existing) return existing;

    const city: City = { id: asCityId(nextId()), ...input };
    this.cities.set(city.id, city);
    return city;
  }

  async ensureCityAirportLink(
    cityId: CityId,
    airportIdent: string,
    isPrimary: boolean,
  ): Promise<void> {
    const airport = this.knownAirports.get(airportIdent);
    if (!airport) {
      throw new Error(`Cannot link unknown airport ident "${airportIdent}" to city ${cityId}`);
    }

    const existingLinks = this.links.get(cityId) ?? [];
    if (existingLinks.some((link) => link.airportId === airport.airportId)) return;

    existingLinks.push({
      airportId: airport.airportId,
      ident: airportIdent,
      icao: undefined,
      name: airport.name,
      physicalTier: airport.physicalTier,
      isPrimary,
    });
    this.links.set(cityId, existingLinks);
  }

  async listCities(): Promise<City[]> {
    return [...this.cities.values()].filter((city) => city.enabled);
  }

  async getCity(cityId: CityId): Promise<City | undefined> {
    return this.cities.get(cityId);
  }

  async listAirportsForCity(cityId: CityId): Promise<CityAirportSummary[]> {
    return this.links.get(cityId) ?? [];
  }
}
