import { calculateGreatCircleDistanceNm, type GeoPoint } from "@oneworld/utils";
import type { AirportId } from "@oneworld/contracts";
import type {
  AirportRepository,
  AirportSearchFilters,
  AirportSummary,
  AirportWithDistance,
  EnsureGameStateInput,
} from "../domain/catalog.types.js";

/** In-memory `AirportRepository` for unit tests. */
export class InMemoryAirportRepository implements AirportRepository {
  private readonly airports = new Map<string, AirportSummary>();
  private readonly gameStateInitialized = new Set<string>();

  seedAirport(airport: AirportSummary): void {
    this.airports.set(airport.id, airport);
  }

  hasGameState(airportId: AirportId): boolean {
    return this.gameStateInitialized.has(airportId);
  }

  async ensureGameState(input: EnsureGameStateInput): Promise<void> {
    this.gameStateInitialized.add(input.airportId);
  }

  async search(filters: AirportSearchFilters): Promise<AirportSummary[]> {
    let results = [...this.airports.values()].filter((airport) => airport.previewEnabled);

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (airport) =>
          airport.ident.toLowerCase().includes(q) ||
          airport.icao?.toLowerCase().includes(q) ||
          airport.name.toLowerCase().includes(q) ||
          airport.municipality?.toLowerCase().includes(q),
      );
    }
    if (filters.countryCode) {
      results = results.filter((airport) => airport.countryCode === filters.countryCode);
    }
    if (filters.physicalTier) {
      results = results.filter((airport) => airport.physicalTier === filters.physicalTier);
    }
    if (filters.near) {
      const origin = filters.near;
      results = results.filter(
        (airport) => calculateGreatCircleDistanceNm(origin, airport) <= origin.maxDistanceNm,
      );
    }

    return results.slice(0, filters.limit ?? 50);
  }

  async getById(airportId: AirportId): Promise<AirportSummary | undefined> {
    return this.airports.get(airportId);
  }

  async listNearby(
    point: GeoPoint,
    maxDistanceNm: number,
    limit: number,
    excludeAirportId?: AirportId,
  ): Promise<AirportWithDistance[]> {
    return [...this.airports.values()]
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
