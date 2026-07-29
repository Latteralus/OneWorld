import type { PlayerId } from "@oneworld/contracts";
import type {
  GrantStartingVehicleInput,
  PlayerVehicle,
  VehicleRepository,
} from "../domain/vehicle.types.js";
import { pickRandomStartingMileage } from "../domain/vehicle.rules.js";

/**
 * The Vehicles domain's public write path for vehicle creation. Onboarding
 * calls `grantStartingVehicle` once, inside its own transaction, after
 * confirming the player has no profile yet - so this method does not need
 * its own idempotency guard.
 */
export class VehicleService {
  constructor(private readonly repo: VehicleRepository) {}

  async grantStartingVehicle(input: GrantStartingVehicleInput): Promise<PlayerVehicle> {
    const vehicleTypeId = await this.repo.ensureVehicleType({
      key: input.typeKey,
      name: input.name,
      valueCents: input.valueCents,
      speedMph: input.speedMph,
      fuelEfficiencyMpg: input.fuelEfficiencyMpg,
      tankCapacityGallons: input.tankCapacityGallons,
      expectedLifespanMiles: input.expectedLifespanMiles,
      weeklyMaintenanceCents: input.weeklyMaintenanceCents,
      quality: input.quality,
      reliability: input.reliability,
      statusScore: input.statusScore,
    });

    return this.repo.insertPlayerVehicle({
      playerId: input.playerId,
      vehicleTypeId,
      vehicleTypeKey: input.typeKey,
      currentCityId: input.currentCityId,
      mileage: pickRandomStartingMileage(input.mileageMin, input.mileageMax),
      // The starting car is a fully-fueled asset; fuel purchases from here on
      // are @oneworld/domain-finance's concern (spec: starting balance already
      // accounts for a full tank).
      fuelGallons: input.tankCapacityGallons,
      condition: "good",
      estimatedValueCents: input.valueCents,
    });
  }

  async getVehicleForPlayer(playerId: PlayerId): Promise<PlayerVehicle | undefined> {
    return this.repo.findVehicleForPlayer(playerId);
  }
}
