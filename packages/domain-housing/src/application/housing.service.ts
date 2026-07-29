import type { PlayerId } from "@oneworld/contracts";
import type {
  GrantStartingResidenceInput,
  HousingRepository,
  PlayerResidence,
} from "../domain/housing.types.js";

/**
 * The Housing domain's public write path for tenancy creation. Onboarding
 * calls `grantStartingResidence` once, inside its own transaction, after
 * confirming the player has no profile yet - so this method does not need
 * its own idempotency guard.
 */
export class HousingService {
  constructor(private readonly repo: HousingRepository) {}

  async grantStartingResidence(input: GrantStartingResidenceInput): Promise<PlayerResidence> {
    const residenceTypeId = await this.repo.ensureResidenceType({
      key: input.residenceTypeKey,
      name: input.residenceTypeName,
      quality: input.quality,
      weeklyRentCents: input.weeklyRentCents,
      parkingCapacity: input.parkingCapacity,
      statusScore: input.statusScore,
    });

    return this.repo.insertPlayerResidence({
      playerId: input.playerId,
      residenceTypeId,
      residenceTypeKey: input.residenceTypeKey,
      cityId: input.cityId,
      tenancyStatus: "ACTIVE",
      nextRentDueAt: input.nextRentDueAt,
    });
  }

  async getActiveResidence(playerId: PlayerId): Promise<PlayerResidence | undefined> {
    return this.repo.findActiveResidenceForPlayer(playerId);
  }
}
