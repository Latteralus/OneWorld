import type { AirportId, CityId, PlayerId } from "@oneworld/contracts";

/** Player profile identity (spec section 6.1, 23.1). */
export interface PlayerProfile {
  id: PlayerId;
  username: string;
  displayName: string;
  companyName: string;
  homeCityId: CityId;
  homeAirportId: AirportId;
  createdAt: Date;
}

/** Input captured during character creation (spec section 6.1). */
export interface CreatePlayerInput {
  authUserId: string;
  username: string;
  displayName: string;
  companyName: string;
  homeCityId: CityId;
  homeAirportId: AirportId;
}
