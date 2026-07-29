import { randomUUID } from "node:crypto";
import type { Database } from "@oneworld/db";
import { getDb, insertDomainEvent } from "@oneworld/db";
import { DrizzleEmploymentRepository, EmploymentService } from "@oneworld/domain-employment";
import { buildIdempotencyKey, DrizzleLedgerRepository, LedgerService } from "@oneworld/domain-finance";
import { DrizzleNotificationRepository, NotificationService } from "@oneworld/domain-notifications";
import { nowUtc } from "@oneworld/utils";
import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Resolves every pending application whose decision delay has elapsed
 * (spec section 8.6, step 6), notifies the player, and records the
 * decision on the outbox. One shared transaction per sweep - each
 * decision's application update, notification, and outbox row commit or
 * roll back together.
 */
export async function runApplicationDecisionSweep(db: Database, now: Date): Promise<void> {
  await db.transaction(async (tx) => {
    const employmentService = new EmploymentService(new DrizzleEmploymentRepository(tx));
    const notificationService = new NotificationService(new DrizzleNotificationRepository(tx));

    const resolutions = await employmentService.resolveDueDecisions(now, () => Math.random());

    for (const { application, posting, accepted } of resolutions) {
      await insertDomainEvent(tx, {
        id: randomUUID(),
        type: accepted ? "JobApplicationAccepted" : "JobApplicationRejected",
        occurredAt: now.toISOString(),
        idempotencyKey: `job-application:${application.id}:decision`,
        data: { applicationId: application.id, postingId: posting.id, playerId: application.playerId },
      });

      await notificationService.create({
        playerId: application.playerId,
        type: "employment_decision",
        title: accepted ? "You got the job!" : "Application update",
        body: accepted
          ? `Your application for ${posting.title} was accepted. Review the offer to start.`
          : `Your application for ${posting.title} was not accepted this time.`,
        relatedType: "job_application",
        relatedId: application.id,
      });
    }
  });
}

/**
 * Pays every employment whose `nextPayAt` has passed (spec section 8.7).
 * `EmploymentService.runPayrollSweep` determines who's owed pay and
 * advances the schedule; this orchestrator does the actual money movement
 * through `LedgerService`, matching "Finance domain writes the ledger
 * entry. Employment domain determines whether pay is owed."
 */
export async function runPayrollSweepTransaction(db: Database, now: Date): Promise<void> {
  await db.transaction(async (tx) => {
    const employmentService = new EmploymentService(new DrizzleEmploymentRepository(tx));
    const ledgerService = new LedgerService(new DrizzleLedgerRepository(tx));

    const due = await employmentService.runPayrollSweep(now);

    for (const { employment, payDateKey } of due) {
      const account = await ledgerService.openAccount({
        ownerType: "player",
        ownerId: employment.playerId,
        accountType: "personal",
      });
      const idempotencyKey = buildIdempotencyKey.employmentPay(employment.id, payDateKey);

      await ledgerService.postEntry({
        accountId: account.id,
        amountCents: employment.dailyWageCents,
        category: "civilian_wage",
        description: `Daily wage - ${employment.title}`,
        relatedType: "employment",
        relatedId: employment.id,
        idempotencyKey,
      });

      await insertDomainEvent(tx, {
        id: randomUUID(),
        type: "DailyWageEarned",
        occurredAt: now.toISOString(),
        idempotencyKey,
        data: {
          employmentId: employment.id,
          playerId: employment.playerId,
          amountCents: employment.dailyWageCents,
          payDateKey,
        },
      });
    }
  });
}

/**
 * Resolves pending job applications once their decision delay elapses
 * (spec section 8.6).
 */
export const employmentApplicationDecisionJob: WorkerJob = {
  name: "employment-application-decision",
  intervalMs: 60_000,
  async run(_ctx: JobContext) {
    await runApplicationDecisionSweep(getDb(), nowUtc());
  },
};

/**
 * Pays active employment once per day at the configured payroll hour
 * (spec section 8.7).
 */
export const dailyPayrollJob: WorkerJob = {
  name: "daily-payroll",
  intervalMs: 5 * 60_000,
  async run(_ctx: JobContext) {
    await runPayrollSweepTransaction(getDb(), nowUtc());
  },
};
