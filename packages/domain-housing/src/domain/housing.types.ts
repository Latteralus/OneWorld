import type { CityId, PlayerId, ResidenceId } from "@oneworld/contracts";
import type { SocialStatusLabel } from "@oneworld/config";
import type { Cents } from "@oneworld/utils";

export interface PlayerResidence {
  id: ResidenceId;
  playerId: PlayerId;
  residenceTypeKey: string;
  cityId: CityId;
  tenancyStatus: string; // see housingTenancyStates in @oneworld/contracts
  nextRentDueAt: Date;
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
