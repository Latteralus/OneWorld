import { randomUUID } from "node:crypto";
import { housingConfig } from "@oneworld/config";
import type { HousingTenancyState } from "@oneworld/contracts";
import type { Database } from "@oneworld/db";
import { getDb, insertDomainEvent } from "@oneworld/db";
import { DrizzleHousingRepository, HousingService } from "@oneworld/domain-housing";
import { buildIdempotencyKey, DrizzleLedgerRepository, LedgerService } from "@oneworld/domain-finance";
import { DrizzleNotificationRepository, NotificationService } from "@oneworld/domain-notifications";
import { cents, formatUtcIsoWeekKey, nowUtc } from "@oneworld/utils";
import type { JobContext, WorkerJob } from "../scheduler.js";

function rentStatusTitle(state: HousingTenancyState): string {
  switch (state) {
    case "ACTIVE":
      return "Rent is paid up";
    case "PAYMENT_DUE":
      return "Rent is due";
    case "OVERDUE_GRACE_PERIOD":
      return "Rent seriously overdue";
    case "EVICTION_PENDING":
      return "Eviction pending";
    case "TEMPORARY_LODGING":
      return "Moved to temporary lodging";
    case "UNHOUSED":
      return "You're currently unhoused";
  }
}

function rentStatusBody(state: HousingTenancyState): string {
  switch (state) {
    case "ACTIVE":
      return "You're all caught up on rent - thanks for paying.";
    case "PAYMENT_DUE":
      return "Your rent payment failed. Pay soon to avoid further consequences.";
    case "OVERDUE_GRACE_PERIOD":
      return "Rent is still unpaid. Your tenancy is now in its final grace period.";
    case "EVICTION_PENDING":
      return "Rent remains unpaid and eviction is now pending.";
    case "TEMPORARY_LODGING":
      return "You've been evicted and moved into temporary lodging at a higher weekly cost. This never blocks flying.";
    case "UNHOUSED":
      return "Temporary lodging payment failed and you are now unhoused. This never blocks flying.";
  }
}

/**
 * Charges weekly rent (or temporary-lodging cost) for every residence due
 * for a sweep pass (spec section 9). `HousingService` never moves money -
 * this orchestrator checks the balance, charges through `LedgerService` on
 * success, and always calls `applyRentOutcome` to advance the tenancy
 * state machine, notifying the player only when the state actually
 * changes (not on routine successful renewal or an unresolved retry).
 */
export async function runRentSweepTransaction(db: Database, now: Date): Promise<void> {
  await db.transaction(async (tx) => {
    const housingService = new HousingService(new DrizzleHousingRepository(tx));
    const ledgerService = new LedgerService(new DrizzleLedgerRepository(tx));
    const notificationService = new NotificationService(new DrizzleNotificationRepository(tx));

    const due = await housingService.listDueForRentSweep(now);

    for (const residence of due) {
      const isTemporaryLodging = residence.tenancyStatus === "TEMPORARY_LODGING";
      const amountCents = isTemporaryLodging
        ? cents(housingConfig.temporaryLodgingWeeklyCostCents)
        : residence.weeklyRentCents;

      const account = await ledgerService.openAccount({
        ownerType: "player",
        ownerId: residence.playerId,
        accountType: "personal",
      });
      const balance = await ledgerService.getAccountBalance(account.id);
      const paymentSucceeded = balance >= amountCents;

      if (paymentSucceeded) {
        const weekKey = formatUtcIsoWeekKey(residence.nextRentDueAt);
        const idempotencyKey = buildIdempotencyKey.housingRent(residence.id, weekKey);

        await ledgerService.postEntry({
          accountId: account.id,
          amountCents: cents(-amountCents),
          category: "weekly_rent",
          description: isTemporaryLodging ? "Temporary lodging" : "Weekly rent",
          relatedType: "residence",
          relatedId: residence.id,
          idempotencyKey,
        });

        await insertDomainEvent(tx, {
          id: randomUUID(),
          type: "RentCharged",
          occurredAt: now.toISOString(),
          idempotencyKey,
          data: { residenceId: residence.id, playerId: residence.playerId, amountCents },
        });
      }

      const previousStatus = residence.tenancyStatus;
      const updated = await housingService.applyRentOutcome({ residence, now, paymentSucceeded });

      if (updated.tenancyStatus !== previousStatus) {
        await notificationService.create({
          playerId: residence.playerId,
          type: "rent_due",
          title: rentStatusTitle(updated.tenancyStatus as HousingTenancyState),
          body: rentStatusBody(updated.tenancyStatus as HousingTenancyState),
          relatedType: "residence",
          relatedId: residence.id,
        });
      }
    }
  });
}

/**
 * Charges weekly rent for active tenancies (spec section 9, 25.1).
 */
export const weeklyRentJob: WorkerJob = {
  name: "weekly-rent",
  intervalMs: 60 * 60_000,
  async run(_ctx: JobContext) {
    await runRentSweepTransaction(getDb(), nowUtc());
  },
};
