import type { PlayerId, VehicleId } from "@oneworld/contracts";
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
}
