import type { PlayerId } from "@oneworld/contracts";
import type {
  GrantStartingQualificationInput,
  PilotHourTotals,
  PlayerQualification,
  QualificationRepository,
} from "../domain/qualification.types.js";

/**
 * The Qualifications domain's write path for granting qualifications (spec
 * section 32: Phase 1 onboarding grants the starting PPL exactly once).
 * Exactly-once is the caller's responsibility (`OnboardingService` checks
 * for an existing player profile before invoking this, inside one shared
 * transaction) - this service does no idempotency-key bookkeeping itself.
 */
export class QualificationService {
  constructor(private readonly repo: QualificationRepository) {}

  async grantStartingQualification(
    input: GrantStartingQualificationInput,
  ): Promise<{ qualification: PlayerQualification; hourTotals: PilotHourTotals }> {
    const qualificationId = await this.repo.ensureQualificationDefinition({
      key: input.qualificationKey,
      name: input.qualificationName,
      type: input.type,
      tuitionCents: input.tuitionCents,
      durationHours: input.durationHours,
      requiresCheckFlight: input.requiresCheckFlight,
    });

    const qualification = await this.repo.insertPlayerQualification({
      playerId: input.playerId,
      qualificationId,
    });

    const hourTotals = await this.repo.initializePilotHourTotals(input.playerId);

    return { qualification, hourTotals };
  }

  async findQualification(
    playerId: PlayerId,
    qualificationKey: string,
  ): Promise<PlayerQualification | undefined> {
    return this.repo.findQualification(playerId, qualificationKey);
  }
}
