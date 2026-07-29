import type { CityId, HousingTenancyState, PlayerId, ResidenceId } from "@oneworld/contracts";
import type { SocialStatusLabel } from "@oneworld/config";
import type { Cents } from "@oneworld/utils";

export interface PlayerResidence {
  id: ResidenceId;
  playerId: PlayerId;
  residenceTypeKey: string;
  cityId: CityId;
  tenancyStatus: string; // see housingTenancyStates in @oneworld/contracts
  weeklyRentCents: Cents;
  nextRentDueAt: Date;
  /** Set while `tenancyStatus` is `PAYMENT_DUE`/`OVERDUE_GRACE_PERIOD`; undefined once resolved. */
  graceDeadlineAt?: Date;
}

/** A row in the `residence_types` catalog table. */
export interface ResidenceType {
  id: string;
  key: string;
  name: string;
  quality: string;
  weeklyRentCents: Cents;
  parkingCapacity: number;
  statusScore: number;
}

/**
 * Everything the caller (onboarding) supplies to grant a player their
 * starting residence. `nextRentDueAt` is passed in rather than computed
 * here so this package stays free of onboarding's prepaid-first-week
 * timing decision (spec section 6.6).
 */
export interface GrantStartingResidenceInput {
  playerId: PlayerId;
  cityId: CityId;
  residenceTypeKey: string;
  residenceTypeName: string;
  weeklyRentCents: Cents;
  quality: string;
  parkingCapacity: number;
  statusScore: number;
  nextRentDueAt: Date;
}

/** Repository interface owned by this domain (spec section 20.4). */
export interface HousingRepository {
  ensureResidenceType(input: {
    key: string;
    name: string;
    quality: string;
    weeklyRentCents: Cents;
    parkingCapacity: number;
    statusScore: number;
  }): Promise<string>;
  insertPlayerResidence(input: {
    playerId: PlayerId;
    residenceTypeId: string;
    /** Carried through onto the returned `PlayerResidence` (the DB row only stores the FK id). */
    residenceTypeKey: string;
    weeklyRentCents: Cents;
    cityId: CityId;
    tenancyStatus: string;
    nextRentDueAt: Date;
  }): Promise<PlayerResidence>;
  findActiveResidenceForPlayer(playerId: PlayerId): Promise<PlayerResidence | undefined>;
  /** Residences with an unresolved rent-sweep pass due: `tenancyStatus != UNHOUSED` and `nextRentDueAt <= now`. */
  listResidencesDueForRentSweep(now: Date): Promise<PlayerResidence[]>;
  updateTenancyOutcome(
    residenceId: ResidenceId,
    input: { tenancyStatus: string; nextRentDueAt: Date; graceDeadlineAt: Date | undefined },
  ): Promise<PlayerResidence>;
}

export interface TenancyTransitionInput {
  currentState: HousingTenancyState;
  paymentSucceeded: boolean;
  now: Date;
  graceDeadlineAt?: Date;
}

export interface TenancyTransitionResult {
  nextState: HousingTenancyState;
  nextGraceDeadlineAt: Date | undefined;
  /** Present only when the due date should move forward; otherwise the caller keeps the residence's existing due date. */
  nextRentDueAt: Date | undefined;
}

export interface StatusScoreInput {
  housingStatusScore: number;
  vehicleStatusScore: number;
  personalLiquidityCents: Cents;
  hasStableEmployment: boolean;
}

export interface StatusScoreResult {
  score: number;
  label: SocialStatusLabel;
}
