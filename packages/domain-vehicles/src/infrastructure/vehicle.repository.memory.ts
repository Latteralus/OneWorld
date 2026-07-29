import type { Cents } from "@oneworld/utils";
import type { CityId, PlayerId, VehicleId } from "@oneworld/contracts";
import type {
  PlayerVehicle,
  VehicleQuality,
  VehicleReliability,
  VehicleRepository,
} from "../domain/vehicle.types.js";

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `mem-${prefix}-${sequence}`;
}

/**
 * In-memory `VehicleRepository` for unit tests and local prototyping
 * (spec section 20.4). The Postgres-backed implementation lives in
 * `vehicle.repository.drizzle.ts` and must uphold the same contract.
 */
export class InMemoryVehicleRepository implements VehicleRepository {
  private readonly vehicleTypesByKey = new Map<
    string,
    {
      id: string;
      key: string;
      name: string;
      quality: VehicleQuality;
      reliability: VehicleReliability;
    }
  >();
  private readonly vehicles = new Map<string, PlayerVehicle>();

  async ensureVehicleType(input: {
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
  }): Promise<string> {
    const existing = this.vehicleTypesByKey.get(input.key);
    if (existing) return existing.id;

    const type = { id: nextId("vehicle-type"), ...input };
    this.vehicleTypesByKey.set(input.key, type);
    return type.id;
  }

  async insertPlayerVehicle(input: {
    playerId: PlayerId;
    vehicleTypeId: string;
    vehicleTypeKey: string;
    weeklyMaintenanceCents: Cents;
    currentCityId: CityId;
    mileage: number;
    fuelGallons: number;
    condition: string;
    estimatedValueCents: Cents;
    nextMaintenanceDueAt: Date;
  }): Promise<PlayerVehicle> {
    const vehicle: PlayerVehicle = {
      id: nextId("vehicle") as VehicleId,
      ownerId: input.playerId,
      vehicleTypeKey: input.vehicleTypeKey,
      mileage: input.mileage,
      fuelGallons: input.fuelGallons,
      condition: input.condition,
      estimatedValueCents: input.estimatedValueCents,
      weeklyMaintenanceCents: input.weeklyMaintenanceCents,
      nextMaintenanceDueAt: input.nextMaintenanceDueAt,
    };
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  async findVehicleForPlayer(playerId: PlayerId): Promise<PlayerVehicle | undefined> {
    return [...this.vehicles.values()].find((vehicle) => vehicle.ownerId === playerId);
  }

  async listVehiclesDueForMaintenance(now: Date): Promise<PlayerVehicle[]> {
    return [...this.vehicles.values()].filter((v) => v.nextMaintenanceDueAt.getTime() <= now.getTime());
  }

  async advanceMaintenance(vehicleId: VehicleId, nextMaintenanceDueAt: Date): Promise<void> {
    const existing = this.vehicles.get(vehicleId);
    if (!existing) throw new Error(`Unknown vehicle: ${vehicleId}`);
    this.vehicles.set(vehicleId, { ...existing, nextMaintenanceDueAt });
  }

  vehicleTypeCount(): number {
    return this.vehicleTypesByKey.size;
  }
}
