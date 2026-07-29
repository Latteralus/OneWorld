import { qualificationConfig, type QualificationKey } from "@oneworld/config";
import type { PilotHourTotals } from "@oneworld/domain-qualifications";
import type { TrainingEligibilityInput, TrainingEligibilityResult } from "./training.types.js";

/**
 * Evaluates whether a player may enroll in a qualification (spec section
 * 17.2/17.5): prerequisite qualifications and required hours by category,
 * both config-driven. This is the one implementation of
 * `calculateTrainingEligibility` (section 21.4) - the UI reads results
 * from here rather than re-implementing the rules.
 */
export function calculateTrainingEligibility(
  input: TrainingEligibilityInput,
): TrainingEligibilityResult {
  const definition = qualificationConfig.definitions.find((d) => d.key === input.qualificationKey);
  if (!definition) {
    throw new Error(`Unknown qualification: ${input.qualificationKey}`);
  }

  const missingPrerequisites = definition.prerequisites.filter(
    (prereq) => !input.ownedQualifications.includes(prereq as QualificationKey),
  ) as QualificationKey[];

  const unmetHourRequirements: TrainingEligibilityResult["unmetHourRequirements"] = [];
  for (const [category, required] of Object.entries(definition.requiredHours) as Array<
    [keyof PilotHourTotals, number]
  >) {
    const actual = input.hours[category] ?? 0;
    if (actual < required) {
      unmetHourRequirements.push({ category, required, actual });
    }
  }

  return {
    eligible: missingPrerequisites.length === 0 && unmetHourRequirements.length === 0,
    missingPrerequisites,
    unmetHourRequirements,
  };
}
