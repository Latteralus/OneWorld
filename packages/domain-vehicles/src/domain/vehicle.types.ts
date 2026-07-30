import type { CityId, PlayerId, VehicleId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";

export type VehicleQuality = "very_poor" | "poor" | "fair" | "good" | "very_good";
export type VehicleReliability = "low" | "medium" | "high";

export interface VehicleType {
  key: string;
  name: string;
  purchasePriceCents: Cents;
  baseResaleValueCents: Cents;
  quality: VehicleQuality;
  reliability: VehicleReliability;
  effectiveTravelSpeedMph: number;
  fuelEfficiencyMpg: number;
  tankCapacityGallons: number;
  expectedLifespanMiles: number;
  weeklyMaintenanceCents: Cents;
  statusScore: number;
}

export interface PlayerVehicle {
  id: VehicleId;
  ownerId: PlayerId;
  vehicleTypeKey: string;
  mileage: number;
  fuelGallons: number;
  condition: string;
  estimatedValueCents: Cents;
  weeklyMaintenanceCents: Cents;
  nextMaintenanceDueAt: Date;
  effectiveTravelSpeedMph: number;
  fuelEfficiencyMpg: number;
}

/**
 * Everything the caller (onboarding) supplies to grant a player their
 * starting vehicle. `mileageMin`/`mileageMax` are passed through so the
 * random starting mileage is picked inside this package via
 * `pickRandomStartingMileage` (see `vehicle.rules.ts`).
 */
export interface GrantStartingVehicleInput {
  playerId: PlayerId;
  currentCityId: CityId;
  typeKey: string;
  name: string;
  valueCents: Cents;
  speedMph: number;
  fuelEfficiencyMpg: number;
  tankCapacityGallons: number;
  expectedLifespanMiles: number;
  weeklyMaintenanceCents: Cents;
  quality: VehicleQuality;
  reliability: VehicleReliability;
  statusScore: number;
  mileageMin: number;
  mileageMax: number;
  nextMaintenanceDueAt: Date;
}

/** Repository interface owned by this domain (spec section 20.4). */
export interface VehicleRepository {
  ensureVehicleType(input: {
    key: string;
    name: string;
    valueCents: Cents;
    speedMph: number;
    fuelEfficiencyMpg: number;
    tankCapacityGallons: number;
    expectedLifespanMiles: number;
    weeklyMaintenanceCents: Cents;
    quality: VehicleQuality;
    reliability: VehicleReliability;
    statusScore: number;
  }): Promise<string>;
  insertPlayerVehicle(input: {
    playerId: PlayerId;
    vehicleTypeId: string;
    /** Carried through onto the returned `PlayerVehicle` (the DB row only stores the FK id). */
    vehicleTypeKey: string;
    weeklyMaintenanceCents: Cents;
    effectiveTravelSpeedMph: number;
    fuelEfficiencyMpg: number;
    currentCityId: CityId;
    mileage: number;
    fuelGallons: number;
    condition: string;
    estimatedValueCents: Cents;
    nextMaintenanceDueAt: Date;
  }): Promise<PlayerVehicle>;
  findVehicleForPlayer(playerId: PlayerId): Promise<PlayerVehicle | undefined>;
  /** Vehicles with an unresolved maintenance charge due: `nextMaintenanceDueAt <= now`. */
  listVehiclesDueForMaintenance(now: Date): Promise<PlayerVehicle[]>;
  /** Called only after a successful charge - a failed charge leaves the due date untouched so the next sweep retries it. */
  advanceMaintenance(vehicleId: VehicleId, nextMaintenanceDueAt: Date): Promise<void>;
  /** Persists mileage after a completed trip (spec section 10.3: "ground travel increases mileage by route distance"). */
  advanceMileage(vehicleId: VehicleId, mileage: number): Promise<void>;
}
