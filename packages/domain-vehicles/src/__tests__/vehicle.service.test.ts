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
      nextMaintenanceDueAt: new Date("2026-08-04T00:00:00Z"),
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
      nextMaintenanceDueAt: new Date("2026-08-04T00:00:00Z"),
    });

    const vehicle = await service.getVehicleForPlayer(playerId);
    expect(vehicle?.vehicleTypeKey).toBe("starting_hunda_attord");
  });
});

describe("VehicleService maintenance sweep (listDueForMaintenance / recordMaintenanceOutcome)", () => {
  async function grantVehicle(service: VehicleService, nextMaintenanceDueAt: Date) {
    return service.grantStartingVehicle({
      playerId: "player-1" as PlayerId,
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
      nextMaintenanceDueAt,
    });
  }

  it("does not surface a vehicle before its due date", async () => {
    const { service } = makeService();
    await grantVehicle(service, new Date("2026-08-04T00:00:00Z"));
    const due = await service.listDueForMaintenance(new Date("2026-08-03T00:00:00Z"));
    expect(due).toHaveLength(0);
  });

  it("advances the due date 7 days on a successful charge", async () => {
    const { service } = makeService();
    const dueAt = new Date("2026-08-04T00:00:00Z");
    const vehicle = await grantVehicle(service, dueAt);

    const [due] = await service.listDueForMaintenance(dueAt);
    expect(due?.vehicle.id).toBe(vehicle.id);
    expect(due?.weekKey).toBe("2026-32");

    await service.recordMaintenanceOutcome({
      vehicleId: vehicle.id,
      previousDueAt: dueAt,
      paymentSucceeded: true,
    });

    const updated = await service.getVehicleForPlayer("player-1" as PlayerId);
    expect(updated?.nextMaintenanceDueAt.toISOString()).toBe("2026-08-11T00:00:00.000Z");
  });

  it("leaves the due date untouched on insufficient funds, so the next sweep retries with no debt or penalty", async () => {
    const { service } = makeService();
    const dueAt = new Date("2026-08-04T00:00:00Z");
    const vehicle = await grantVehicle(service, dueAt);

    await service.recordMaintenanceOutcome({
      vehicleId: vehicle.id,
      previousDueAt: dueAt,
      paymentSucceeded: false,
    });

    const stillDue = await service.listDueForMaintenance(dueAt);
    expect(stillDue).toHaveLength(1);
    expect(stillDue[0]?.vehicle.nextMaintenanceDueAt).toEqual(dueAt);
  });
});
