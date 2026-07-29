import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import type { CityId, PlayerId } from "@oneworld/contracts";
import { VehicleService } from "../application/vehicle.service.js";
import { InMemoryVehicleRepository } from "../infrastructure/vehicle.repository.memory.js";

function makeService() {
  const repo = new InMemoryVehicleRepository();
  return { repo, service: new VehicleService(repo) };
}

describe("VehicleService.grantStartingVehicle", () => {
  it("grants a fully-fueled starting vehicle within the mileage range (spec section 6.4)", async () => {
    const { service } = makeService();
    const playerId = "player-1" as PlayerId;
    const currentCityId = "city-1" as CityId;

    const vehicle = await service.grantStartingVehicle({
      playerId,
      currentCityId,
      typeKey: "starting_hunda_attord",
      name: "1996 Hunda Attord",
      valueCents: cents(50_000),
      speedMph: 55,
      fuelEfficiencyMpg: 24,
      tankCapacityGallons: 16,
      expectedLifespanMiles: 250_000,
      weeklyMaintenanceCents: cents(2_500),
      quality: "very_poor",
      reliability: "low",
      statusScore: 0,
      mileageMin: 170_000,
      mileageMax: 235_000,
    });

    expect(vehicle.ownerId).toBe(playerId);
    expect(vehicle.vehicleTypeKey).toBe("starting_hunda_attord");
    expect(vehicle.fuelGallons).toBe(16);
    expect(vehicle.condition).toBe("good");
    expect(vehicle.estimatedValueCents).toBe(50_000);
    expect(vehicle.mileage).toBeGreaterThanOrEqual(170_000);
    expect(vehicle.mileage).toBeLessThanOrEqual(235_000);
  });

  it("does not create a duplicate vehicle type row for repeated grants of the same key", async () => {
    const { repo } = makeService();
    const typeInput = {
      key: "starting_hunda_attord",
      name: "1996 Hunda Attord",
      valueCents: cents(50_000),
      speedMph: 55,
      fuelEfficiencyMpg: 24,
      tankCapacityGallons: 16,
      expectedLifespanMiles: 250_000,
      weeklyMaintenanceCents: cents(2_500),
      quality: "very_poor" as const,
      reliability: "low" as const,
      statusScore: 0,
    };

    const firstId = await repo.ensureVehicleType(typeInput);
    const secondId = await repo.ensureVehicleType(typeInput);

    expect(secondId).toBe(firstId);
    expect(repo.vehicleTypeCount()).toBe(1);
  });
});

describe("VehicleService.getVehicleForPlayer", () => {
  it("returns undefined when the player has no vehicle yet", async () => {
    const { service } = makeService();
    await expect(service.getVehicleForPlayer("player-1" as PlayerId)).resolves.toBeUndefined();
  });

  it("returns the granted vehicle", async () => {
    const { service } = makeService();
    const playerId = "player-1" as PlayerId;
    await service.grantStartingVehicle({
      playerId,
      currentCityId: "city-1" as CityId,
      typeKey: "starting_hunda_attord",
      name: "1996 Hunda Attord",
      valueCents: cents(50_000),
      speedMph: 55,
      fuelEfficiencyMpg: 24,
      tankCapacityGallons: 16,
      expectedLifespanMiles: 250_000,
      weeklyMaintenanceCents: cents(2_500),
      quality: "very_poor",
      reliability: "low",
      statusScore: 0,
      mileageMin: 170_000,
      mileageMax: 235_000,
    });

    const vehicle = await service.getVehicleForPlayer(playerId);
    expect(vehicle?.vehicleTypeKey).toBe("starting_hunda_attord");
  });
});
