import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Resolves pending job applications once their decision delay elapses
 * (spec section 8.6). TODO(Phase 2): call
 * `@oneworld/domain-employment`'s `EmploymentService.resolveDecisions()`
 * using `resolveApplicationAcceptance`.
 */
export const employmentApplicationDecisionJob: WorkerJob = {
  name: "employment-application-decision",
  intervalMs: 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 2 (Employment and Recurring Economy) lands.
  },
};

/**
 * Pays active employment once per day at the configured payroll hour
 * (spec section 8.7). TODO(Phase 2): call
 * `@oneworld/domain-employment`'s payroll sweep, posting through
 * `@oneworld/domain-finance`'s `LedgerService` with a
 * `buildIdempotencyKey.employmentPay(...)` key.
 */
export const dailyPayrollJob: WorkerJob = {
  name: "daily-payroll",
  intervalMs: 5 * 60_000,
  async run(_ctx: JobContext) {
    // Intentionally a no-op until Phase 2 lands.
  },
};
