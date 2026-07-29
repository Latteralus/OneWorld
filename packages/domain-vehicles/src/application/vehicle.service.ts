import type { PlayerId, VehicleId } from "@oneworld/contracts";
import { addDays, formatUtcIsoWeekKey } from "@oneworld/utils";
import type {
  GrantStartingVehicleInput,
  PlayerVehicle,
  VehicleRepository,
} from "../domain/vehicle.types.js";
import { pickRandomStartingMileage } from "../domain/vehicle.rules.js";

export interface MaintenanceDue {
  vehicle: PlayerVehicle;
  /** The ISO week (UTC) this charge is for - stable across a late-running sweep, for the caller's idempotency key. */
  weekKey: string;
}

/**
 * The Vehicles domain's public read/write path (spec section 10, 24.2).
 * Money never moves here - `listDueForMaintenance`/`recordMaintenanceOutcome`
 * split maintenance charging the same way
 * `@oneworld/domain-employment`'s `EmploymentService.runPayrollSweep` and
 * `@oneworld/domain-housing`'s rent sweep keep money movement out of their
 * own domains.
 */
export class VehicleService {
  constructor(private readonly repo: VehicleRepository) {}

  /**
   * Onboarding calls this once, inside its own transaction, after
   * confirming the player has no profile yet - so this method does not
   * need its own idempotency guard.
   */
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
      weeklyMaintenanceCents: input.weeklyMaintenanceCents,
      currentCityId: input.currentCityId,
      mileage: pickRandomStartingMileage(input.mileageMin, input.mileageMax),
      // The starting car is a fully-fueled asset; fuel purchases from here on
      // are @oneworld/domain-finance's concern (spec: starting balance already
      // accounts for a full tank).
      fuelGallons: input.tankCapacityGallons,
      condition: "good",
      estimatedValueCents: input.valueCents,
      nextMaintenanceDueAt: input.nextMaintenanceDueAt,
    });
  }

  async getVehicleForPlayer(playerId: PlayerId): Promise<PlayerVehicle | undefined> {
    return this.repo.findVehicleForPlayer(playerId);
  }

  /** Vehicles due for a weekly-maintenance sweep pass (spec section 10.5). */
  async listDueForMaintenance(now: Date): Promise<MaintenanceDue[]> {
    const due = await this.repo.listVehiclesDueForMaintenance(now);
    return due.map((vehicle) => ({ vehicle, weekKey: formatUtcIsoWeekKey(vehicle.nextMaintenanceDueAt) }));
  }

  /**
   * Records the outcome of one maintenance-charge attempt the caller
   * already made. On success, advances the due date 7 days from the
   * *previous* due date (not `now`), so a late-running sweep doesn't drift
   * the schedule. On failure, the due date is left untouched - it's
   * retried on the next sweep, with no debt or penalty (`vehicleConfig.breakdownsEnabled`
   * is `false`; mechanical failure is out of scope for the preview).
   */
  async recordMaintenanceOutcome(input: {
    vehicleId: VehicleId;
    previousDueAt: Date;
    paymentSucceeded: boolean;
  }): Promise<void> {
    if (!input.paymentSucceeded) return;
    await this.repo.advanceMaintenance(input.vehicleId, addDays(input.previousDueAt, 7));
  }
}
