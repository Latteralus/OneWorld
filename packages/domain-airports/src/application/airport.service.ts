import type { AirportId } from "@oneworld/contracts";
import type {
  AirportRepository,
  AirportSearchFilters,
  AirportSummary,
  AirportWithDistance,
  EnsureGameStateInput,
} from "../domain/catalog.types.js";

/** Default radius for "nearby airports" on the detail page (spec section 12.4). */
const DEFAULT_NEARBY_RADIUS_NM = 75;
const DEFAULT_NEARBY_LIMIT = 8;

/**
 * The airport domain's public read path for the browser/map/detail UI
 * (spec section 24.2) plus game-state initialization for newly-imported
 * airports. Other domains query airports through here rather than
 * reading `airports`/`airport_game_state` directly (section 24.1).
 */
export class AirportService {
  constructor(private readonly repo: AirportRepository) {}

  async ensureGameState(input: EnsureGameStateInput): Promise<void> {
    return this.repo.ensureGameState(input);
  }

  async search(filters: AirportSearchFilters): Promise<AirportSummary[]> {
    return this.repo.search(filters);
  }

  async getById(airportId: AirportId): Promise<AirportSummary | undefined> {
    return this.repo.getById(airportId);
  }

  async listNearby(
    airport: Pick<AirportSummary, "id" | "latitude" | "longitude">,
    radiusNm: number = DEFAULT_NEARBY_RADIUS_NM,
    limit: number = DEFAULT_NEARBY_LIMIT,
  ): Promise<AirportWithDistance[]> {
    return this.repo.listNearby(airport, radiusNm, limit, airport.id);
  }
}
