import { addHours, addMinutes } from "@oneworld/utils";
import { employmentConfig, type EmploymentAvailability } from "@oneworld/config";

/**
 * A player may hold exactly one active job (spec section 8.2). Callers
 * must replace, not add to, the existing employment slot.
 */
export function canHoldAdditionalJob(currentActiveJobCount: number): boolean {
  return currentActiveJobCount < employmentConfig.maxActiveJobs;
}

/** Picks a decision delay within the configured window (spec section 8.6). */
export function calculateApplicationDecisionDelayMinutes(randomUnit: number): number {
  if (randomUnit < 0 || randomUnit >= 1) {
    throw new RangeError("randomUnit must be in [0, 1)");
  }
  const minHours = employmentConfig.applicationDecisionDelayHoursMin;
  const maxHours = employmentConfig.applicationDecisionDelayHoursMax;
  const hours = minHours + randomUnit * (maxHours - minHours);
  return Math.round(hours * 60);
}

export function calculateDecisionAt(submittedAt: Date, randomUnit: number): Date {
  return addMinutes(submittedAt, calculateApplicationDecisionDelayMinutes(randomUnit));
}

/**
 * Deterministic accept/reject decision given a pre-drawn random value in
 * [0, 1) - keeping the RNG outside this function makes the rule itself
 * pure and unit-testable (spec section 30.1: "employment acceptance").
 */
export function resolveApplicationAcceptance(
  availability: EmploymentAvailability,
  randomUnit: number,
): boolean {
  return randomUnit < employmentConfig.baseAcceptanceRateByAvailability[availability];
}

/**
 * Next daily payroll instant at the configured local hour (spec section
 * 8.7, 35.10). Simplified to a fixed UTC hour for Phase 0; a DST-aware
 * conversion against `gameClockConfig.defaultDisplayTimezone` is needed
 * before this ships (America/New_York shifts by an hour across DST).
 */
export function calculateNextPayrollAt(
  fromUtc: Date,
  payrollHourLocal = employmentConfig.payrollHourLocal,
): Date {
  const next = new Date(fromUtc);
  next.setUTCHours(payrollHourLocal, 0, 0, 0);
  if (next.getTime() <= fromUtc.getTime()) {
    return addHours(next, 24);
  }
  return next;
}

export function isPayrollDue(nextPayAt: Date, referenceNow: Date): boolean {
  return nextPayAt.getTime() <= referenceNow.getTime();
}
