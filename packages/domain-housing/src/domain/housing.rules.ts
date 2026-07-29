import { housingConfig, type SocialStatusLabel } from "@oneworld/config";
import { centsToDollars } from "@oneworld/utils";
import type { StatusScoreInput, StatusScoreResult } from "./housing.types.js";

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
