import type { AirportId, CityId, PlayerId } from "@oneworld/contracts";
import type { PlayerProfile } from "./player.types.js";

/** Character-creation input (spec section 6.1). */
export interface CompleteOnboardingInput {
  authUserId: string;
  username: string;
  displayName: string;
  companyName: string;
  homeCityId: CityId;
  homeAirportId: AirportId;
}

/**
 * Everything granted by one onboarding run (spec section 6.5, roadmap
 * Phase 1 exit criterion: "starting assets are granted exactly once").
 * `alreadyOnboarded: true` means the call was a no-op replay - the profile
 * already existed and nothing was (re-)granted, so the grant ids below are
 * `undefined` (the caller already has them from the original call; this
 * method's job on replay is just to confirm no duplicate grant happened,
 * not to re-fetch every sub-resource).
 */
export interface OnboardingResult {
  profile: PlayerProfile;
  alreadyOnboarded: boolean;
  personalAccountId: string | undefined;
  companyAccountId: string | undefined;
  residenceId: string | undefined;
  vehicleId: string | undefined;
  qualificationId: string | undefined;
}

/** Payload for the `PlayerCreated` domain event (spec section 24.3). */
export interface PlayerCreatedEventData {
  playerId: PlayerId;
  username: string;
  homeCityId: CityId;
  homeAirportId: AirportId;
}

/** Payload for the `StartingAssetsGranted` domain event (spec section 24.3). */
export interface StartingAssetsGrantedEventData {
  playerId: PlayerId;
  personalAccountId: string;
  companyAccountId: string;
  residenceId: string;
  vehicleId: string;
  qualificationId: string;
}
