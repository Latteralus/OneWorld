import type { AirportId, CityId, GroundTravelId, PlayerId, VehicleId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";
import type { GeoPoint } from "@oneworld/utils";

export type TravelMode = "personal_vehicle" | "bus";

export interface TravelEndpoint {
  type: "city" | "airport";
  cityId?: CityId;
  airportId?: AirportId;
  point: GeoPoint;
}

export interface GroundTravelQuoteInput {
  mode: TravelMode;
  origin: TravelEndpoint;
  destination: TravelEndpoint;
  /** Required when `mode` is "personal_vehicle". */
  vehicle?: {
    id: VehicleId;
    effectiveTravelSpeedMph: number;
    fuelEfficiencyMpg: number;
  };
}

export interface GroundTravelQuote {
  mode: TravelMode;
  distanceMiles: number;
  durationMinutes: number;
  costCents: Cents;
  fuelGallonsUsed?: number;
}

export interface GroundTravelRecord {
  id: GroundTravelId;
  playerId: PlayerId;
  mode: TravelMode;
  vehicleId?: VehicleId;
  distanceMiles: number;
  costCents: Cents;
  status: string; // see groundTravelStates in @oneworld/contracts
  departedAt?: Date;
  arrivesAt: Date;
  completedAt?: Date;
}
