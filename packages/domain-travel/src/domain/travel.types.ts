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

/**
 * Id-only reference to a travel endpoint, for persisted records - distinct
 * from `TravelEndpoint`, which carries a `point: GeoPoint` needed only at
 * quote time. Matches `ground_travel`'s `originType`/`originCityId`/
 * `originAirportId` (and the `destination*` equivalents) column shape.
 */
export type TravelEndpointRef =
  | { type: "city"; cityId: CityId }
  | { type: "airport"; airportId: AirportId };

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
  origin: TravelEndpointRef;
  destination: TravelEndpointRef;
  distanceMiles: number;
  costCents: Cents;
  fuelGallonsUsed?: number;
  status: string; // see groundTravelStates in @oneworld/contracts
  departedAt?: Date;
  arrivesAt: Date;
  completedAt?: Date;
}

/** Everything needed to start ground travel (spec section 11.3-11.5). */
export interface StartGroundTravelInput {
  playerId: PlayerId;
  mode: TravelMode;
  origin: TravelEndpoint;
  destination: TravelEndpoint;
  vehicle?: {
    id: VehicleId;
    effectiveTravelSpeedMph: number;
    fuelEfficiencyMpg: number;
  };
  now: Date;
}

/** Repository interface owned by this domain (spec section 20.4). */
export interface GroundTravelRepository {
  insertPreparingTravel(input: {
    playerId: PlayerId;
    mode: TravelMode;
    vehicleId?: VehicleId;
    origin: TravelEndpointRef;
    destination: TravelEndpointRef;
    distanceMiles: number;
    costCents: Cents;
    fuelGallonsUsed?: number;
    arrivesAt: Date;
  }): Promise<GroundTravelRecord>;
  /** Flips `PREPARING` to `TRAVELING` (spec section 11.5) - departure is instantaneous in the preview, see this package's README. */
  markDeparted(travelId: GroundTravelId, departedAt: Date): Promise<GroundTravelRecord>;
  markArrived(travelId: GroundTravelId, completedAt: Date): Promise<GroundTravelRecord>;
  /** Any record in `PREPARING`/`TRAVELING` for this player - both the "already traveling" guard and the multiple-locations guard rely on this. */
  getActiveTravelForPlayer(playerId: PlayerId): Promise<GroundTravelRecord | undefined>;
  getById(travelId: GroundTravelId): Promise<GroundTravelRecord | undefined>;
  /** `TRAVELING` records whose `arrivesAt` has passed (spec section 25.1's ground-travel-completion job). */
  listDueForCompletion(now: Date): Promise<GroundTravelRecord[]>;
}
