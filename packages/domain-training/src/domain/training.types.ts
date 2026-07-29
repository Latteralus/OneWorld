import type { QualificationKey } from "@oneworld/config";
import type { PlayerId, QualificationId, TrainingEnrollmentId } from "@oneworld/contracts";
import type { PilotHourTotals } from "@oneworld/domain-qualifications";

export interface TrainingEligibilityInput {
  qualificationKey: QualificationKey;
  ownedQualifications: QualificationKey[];
  hours: PilotHourTotals;
}

export interface TrainingEligibilityResult {
  eligible: boolean;
  missingPrerequisites: QualificationKey[];
  unmetHourRequirements: Array<{
    category: keyof PilotHourTotals;
    required: number;
    actual: number;
  }>;
}

export interface TrainingEnrollment {
  id: TrainingEnrollmentId;
  playerId: PlayerId;
  qualificationId: QualificationId;
  status: string; // see trainingEnrollmentStates in @oneworld/contracts
  startedAt: Date;
  completesAt: Date;
}
