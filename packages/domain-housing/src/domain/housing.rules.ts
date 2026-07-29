import { housingConfig, type SocialStatusLabel } from "@oneworld/config";
import { addDays, addHours, centsToDollars } from "@oneworld/utils";
import type { HousingTenancyState } from "@oneworld/contracts";
import type {
  StatusScoreInput,
  StatusScoreResult,
  TenancyTransitionInput,
  TenancyTransitionResult,
} from "./housing.types.js";

const LIQUIDITY_DOLLARS_PER_POINT = 2_500;
const MAX_LIQUIDITY_POINTS = 4;
const STABLE_EMPLOYMENT_POINTS = 1;

/**
 * Descriptive social-status score (spec section 9.3). Status is flavor and
 * profile presentation in the preview - it must not create large direct
 * payout bonuses, so this function only ever returns a label, never money.
 * The one implementation of `calculateStatusScore` (section 21.4).
 */
export function calculateStatusScore(input: StatusScoreInput): StatusScoreResult {
  const liquidityPoints = Math.min(
    MAX_LIQUIDITY_POINTS,
    Math.floor(centsToDollars(input.personalLiquidityCents) / LIQUIDITY_DOLLARS_PER_POINT),
  );
  const employmentPoints = input.hasStableEmployment ? STABLE_EMPLOYMENT_POINTS : 0;

  const rawScore =
    input.housingStatusScore + input.vehicleStatusScore + liquidityPoints + employmentPoints;

  const maxIndex = housingConfig.socialStatusLabels.length - 1;
  const score = Math.max(0, Math.min(maxIndex, rawScore));
  const label = housingConfig.socialStatusLabels[score] as SocialStatusLabel;

  return { score, label };
}

/** Next weekly rent due date (spec section 9, 7.4). */
export function calculateNextRentDueAt(from: Date): Date {
  return addDays(from, 7);
}

/** Grace deadline for an unpaid charge (spec section 35.11, `housingConfig.rentGracePeriodHours`). */
export function calculateGraceDeadline(from: Date): Date {
  return addHours(from, housingConfig.rentGracePeriodHours);
}

/**
 * Tenancy state transition for one rent-sweep attempt (spec section 9.1's
 * state list; timing is a placeholder decision - see the Phase 2 change
 * log entry). Housing failure must always be recoverable and must never
 * permanently block flying, so every non-terminal state keeps retrying the
 * charge on the next sweep, and a successful charge from any state jumps
 * straight back to `ACTIVE`.
 *
 * `ACTIVE` -[unpaid]-> `PAYMENT_DUE` -[grace elapsed, unpaid]->
 * `OVERDUE_GRACE_PERIOD` -[grace elapsed, unpaid]-> `EVICTION_PENDING`
 * -[unpaid]-> `TEMPORARY_LODGING` (billed separately, `temporaryLodgingWeeklyCostCents`)
 * -[unpaid]-> `UNHOUSED`.
 */
export function nextTenancyState(input: TenancyTransitionInput): TenancyTransitionResult {
  if (input.paymentSucceeded) {
    return {
      nextState: "ACTIVE",
      nextGraceDeadlineAt: undefined,
      nextRentDueAt: calculateNextRentDueAt(input.now),
    };
  }

  const graceElapsed = input.graceDeadlineAt !== undefined && input.now.getTime() >= input.graceDeadlineAt.getTime();

  switch (input.currentState) {
    case "ACTIVE":
      return {
        nextState: "PAYMENT_DUE",
        nextGraceDeadlineAt: calculateGraceDeadline(input.now),
        nextRentDueAt: undefined,
      };
    case "PAYMENT_DUE":
      return graceElapsed
        ? {
            nextState: "OVERDUE_GRACE_PERIOD",
            nextGraceDeadlineAt: calculateGraceDeadline(input.now),
            nextRentDueAt: undefined,
          }
        : { nextState: "PAYMENT_DUE", nextGraceDeadlineAt: input.graceDeadlineAt, nextRentDueAt: undefined };
    case "OVERDUE_GRACE_PERIOD":
      return graceElapsed
        ? { nextState: "EVICTION_PENDING", nextGraceDeadlineAt: undefined, nextRentDueAt: undefined }
        : {
            nextState: "OVERDUE_GRACE_PERIOD",
            nextGraceDeadlineAt: input.graceDeadlineAt,
            nextRentDueAt: undefined,
          };
    case "EVICTION_PENDING":
      // Evicts into temporary lodging, which starts its own weekly billing cycle from now.
      return {
        nextState: "TEMPORARY_LODGING",
        nextGraceDeadlineAt: undefined,
        nextRentDueAt: calculateNextRentDueAt(input.now),
      };
    case "TEMPORARY_LODGING":
      return { nextState: "UNHOUSED", nextGraceDeadlineAt: undefined, nextRentDueAt: undefined };
    case "UNHOUSED":
      return { nextState: "UNHOUSED", nextGraceDeadlineAt: undefined, nextRentDueAt: undefined };
    default: {
      const exhaustive: never = input.currentState;
      throw new Error(`Unhandled tenancy state: ${exhaustive as HousingTenancyState}`);
    }
  }
}
