import type { HousingTenancyState, PlayerId, ResidenceId } from "@oneworld/contracts";
import type {
  GrantStartingResidenceInput,
  HousingRepository,
  PlayerResidence,
} from "../domain/housing.types.js";
import { nextTenancyState } from "../domain/housing.rules.js";

/**
 * The Housing domain's public read/write path for tenancy (spec section 9,
 * 24.2). Money never moves here - `applyRentOutcome` only records the
 * result of a charge attempt the caller already made through
 * `@oneworld/domain-finance`'s `LedgerService`, mirroring how
 * `@oneworld/domain-employment`'s `EmploymentService.runPayrollSweep`
 * keeps money movement out of the employment domain.
 */
export class HousingService {
  constructor(private readonly repo: HousingRepository) {}

  /**
   * Onboarding calls this once, inside its own transaction, after
   * confirming the player has no profile yet - so this method does not
   * need its own idempotency guard.
   */
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
      weeklyRentCents: input.weeklyRentCents,
      cityId: input.cityId,
      tenancyStatus: "ACTIVE",
      nextRentDueAt: input.nextRentDueAt,
    });
  }

  async getActiveResidence(playerId: PlayerId): Promise<PlayerResidence | undefined> {
    return this.repo.findActiveResidenceForPlayer(playerId);
  }

  /** Residences due for a rent-sweep pass (spec section 9.1) - due date passed and not yet `UNHOUSED`. */
  async listDueForRentSweep(now: Date): Promise<PlayerResidence[]> {
    return this.repo.listResidencesDueForRentSweep(now);
  }

  /**
   * Records the outcome of one rent-charge attempt the caller already made
   * (or didn't, because funds were insufficient) and advances the tenancy
   * state machine accordingly (`nextTenancyState`, spec section 9.1).
   */
  async applyRentOutcome(input: {
    residence: PlayerResidence;
    now: Date;
    paymentSucceeded: boolean;
  }): Promise<PlayerResidence> {
    const transition = nextTenancyState({
      currentState: input.residence.tenancyStatus as HousingTenancyState,
      paymentSucceeded: input.paymentSucceeded,
      now: input.now,
      graceDeadlineAt: input.residence.graceDeadlineAt,
    });

    return this.repo.updateTenancyOutcome(input.residence.id as ResidenceId, {
      tenancyStatus: transition.nextState,
      nextRentDueAt: transition.nextRentDueAt ?? input.residence.nextRentDueAt,
      graceDeadlineAt: transition.nextGraceDeadlineAt,
    });
  }
}
