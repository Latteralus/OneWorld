import { randomUUID } from "node:crypto";
import type { Database } from "@oneworld/db";
import { getDb, insertDomainEvent } from "@oneworld/db";
import { buildIdempotencyKey, DrizzleLedgerRepository, LedgerService } from "@oneworld/domain-finance";
import { DrizzleVehicleRepository, VehicleService } from "@oneworld/domain-vehicles";
import { cents, nowUtc } from "@oneworld/utils";
import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Charges weekly vehicle maintenance for every vehicle due for a sweep
 * pass (spec section 10.5). `VehicleService` never moves money - this
 * orchestrator checks the balance and charges through `LedgerService` on
 * success. On insufficient funds the charge is simply skipped and retried
 * next sweep - no debt, no penalty (`vehicleConfig.breakdownsEnabled` is
 * `false`; mechanical failure is out of scope for the preview).
 */
export async function runVehicleMaintenanceSweepTransaction(db: Database, now: Date): Promise<void> {
  await db.transaction(async (tx) => {
    const vehicleService = new VehicleService(new DrizzleVehicleRepository(tx));
    const ledgerService = new LedgerService(new DrizzleLedgerRepository(tx));

    const due = await vehicleService.listDueForMaintenance(now);

    for (const { vehicle, weekKey } of due) {
      const account = await ledgerService.openAccount({
        ownerType: "player",
        ownerId: vehicle.ownerId,
        accountType: "personal",
      });
      const balance = await ledgerService.getAccountBalance(account.id);
      const paymentSucceeded = balance >= vehicle.weeklyMaintenanceCents;

      if (paymentSucceeded) {
        const idempotencyKey = buildIdempotencyKey.vehicleMaintenance(vehicle.id, weekKey);

        await ledgerService.postEntry({
          accountId: account.id,
          amountCents: cents(-vehicle.weeklyMaintenanceCents),
          category: "vehicle_maintenance",
          description: "Weekly vehicle maintenance",
          relatedType: "vehicle",
          relatedId: vehicle.id,
          idempotencyKey,
        });

        await insertDomainEvent(tx, {
          id: randomUUID(),
          type: "VehicleMaintenanceCharged",
          occurredAt: now.toISOString(),
          idempotencyKey,
          data: { vehicleId: vehicle.id, playerId: vehicle.ownerId, amountCents: vehicle.weeklyMaintenanceCents },
        });
      }

      await vehicleService.recordMaintenanceOutcome({
        vehicleId: vehicle.id,
        previousDueAt: vehicle.nextMaintenanceDueAt,
        paymentSucceeded,
      });
    }
  });
}

/**
 * Charges weekly vehicle maintenance (spec section 10.5, 25.1).
 */
export const weeklyVehicleMaintenanceJob: WorkerJob = {
  name: "weekly-vehicle-maintenance",
  intervalMs: 60 * 60_000,
  async run(_ctx: JobContext) {
    await runVehicleMaintenanceSweepTransaction(getDb(), nowUtc());
  },
};
