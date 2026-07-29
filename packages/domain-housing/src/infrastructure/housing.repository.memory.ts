import type { Cents } from "@oneworld/utils";
import type { CityId, PlayerId, ResidenceId } from "@oneworld/contracts";
import type { HousingRepository, PlayerResidence, ResidenceType } from "../domain/housing.types.js";

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `mem-${prefix}-${sequence}`;
}

/**
 * In-memory `HousingRepository` for unit tests and local prototyping
 * (spec section 20.4). The Postgres-backed implementation lives in
 * `housing.repository.drizzle.ts` and must uphold the same contract.
 */
export class InMemoryHousingRepository implements HousingRepository {
  private readonly residenceTypesByKey = new Map<string, ResidenceType>();
  private readonly residences = new Map<string, PlayerResidence>();

  async ensureResidenceType(input: {
    key: string;
    name: string;
    quality: string;
    weeklyRentCents: Cents;
    parkingCapacity: number;
    statusScore: number;
  }): Promise<string> {
    const existing = this.residenceTypesByKey.get(input.key);
    if (existing) return existing.id;

    const type: ResidenceType = { id: nextId("residence-type"), ...input };
    this.residenceTypesByKey.set(input.key, type);
    return type.id;
  }

  async insertPlayerResidence(input: {
    playerId: PlayerId;
    residenceTypeId: string;
    residenceTypeKey: string;
    cityId: CityId;
    tenancyStatus: string;
    nextRentDueAt: Date;
  }): Promise<PlayerResidence> {
    const residence: PlayerResidence = {
      id: nextId("residence") as ResidenceId,
      playerId: input.playerId,
      residenceTypeKey: input.residenceTypeKey,
      cityId: input.cityId,
      tenancyStatus: input.tenancyStatus,
      nextRentDueAt: input.nextRentDueAt,
    };
    this.residences.set(residence.id, residence);
    return residence;
  }

  async findActiveResidenceForPlayer(playerId: PlayerId): Promise<PlayerResidence | undefined> {
    return [...this.residences.values()].find(
      (r) => r.playerId === playerId && r.tenancyStatus === "ACTIVE",
    );
  }

  residenceTypeCount(): number {
    return this.residenceTypesByKey.size;
  }
}
