import type { CityId, JobApplicationId, JobPostingId, PlayerId } from "@oneworld/contracts";
import { DomainError } from "@oneworld/contracts";
import { employmentConfig, type EmploymentAvailability } from "@oneworld/config";
import { addDays, cents, formatUtcDateKey, nowUtc } from "@oneworld/utils";
import type {
  EmploymentRepository,
  JobApplication,
  JobPosting,
  PlayerEmployment,
} from "../domain/employment.types.js";
import {
  calculateDecisionAt,
  calculateNextPayrollAt,
  isPayrollDue,
  resolveApplicationAcceptance,
} from "../domain/employment.rules.js";

export interface PayrollDue {
  employment: PlayerEmployment;
  /** The calendar day (UTC) this payment is for - stable across a late-running sweep, for the caller's idempotency key. */
  payDateKey: string;
}

export interface DecisionResolution {
  application: JobApplication;
  posting: JobPosting;
  accepted: boolean;
}

/**
 * The Employment domain's public read/write path (spec section 8, 24.2).
 * Money never moves here - `runPayrollSweep` only determines whether pay
 * is owed and advances the schedule; the caller posts the actual ledger
 * entry through `@oneworld/domain-finance`'s `LedgerService` (section 8.7:
 * "Finance domain writes the ledger entry. Employment domain determines
 * whether pay is owed.").
 */
export class EmploymentService {
  constructor(private readonly repo: EmploymentRepository) {}

  async listOpenPostings(cityId: CityId): Promise<JobPosting[]> {
    return this.repo.listOpenPostings(cityId);
  }

  /**
   * Seeds one long-lived posting per configured job template per city
   * (spec section 8.5) - idempotent, safe to run once per deploy or
   * repeatedly from a setup script (mirrors `CityService.seedStartingCities`).
   */
  async seedJobPostings(cityIds: CityId[]): Promise<JobPosting[]> {
    const created: JobPosting[] = [];
    const expiresAt = addDays(nowUtc(), employmentConfig.seedPostingValidityDays);

    for (const template of employmentConfig.jobTemplates) {
      const dailyWageCents = cents(template.dailyWageCents);
      const templateId = await this.repo.ensureJobTemplate({
        key: template.key,
        title: template.title,
        category: employmentConfig.seedPostingCategory,
        dailyWageCents,
      });

      for (const cityId of cityIds) {
        const posting = await this.repo.ensurePosting({
          cityId,
          templateId,
          templateKey: template.key,
          title: template.title,
          dailyWageCents,
          openings: employmentConfig.seedPostingOpenings,
          expiresAt,
        });
        created.push(posting);
      }
    }

    return created;
  }

  async getActiveEmployment(playerId: PlayerId): Promise<PlayerEmployment | undefined> {
    return this.repo.getActiveEmployment(playerId);
  }

  /**
   * Submits an application (spec section 8.6, steps 1-5). One pending
   * application at a time keeps the delayed-decision flow simple - a
   * player wanting a different job while one is pending waits for the
   * decision (or declines an existing offer) first.
   */
  async submitApplication(input: {
    playerId: PlayerId;
    postingId: JobPostingId;
    now: Date;
    randomUnit: number;
  }): Promise<JobApplication> {
    const posting = await this.repo.getPostingById(input.postingId);
    if (!posting || posting.status !== "OPEN") {
      throw new DomainError(
        "JOB_POSTING_UNAVAILABLE",
        "This posting is no longer accepting applications.",
        { postingId: input.postingId },
      );
    }

    const pending = await this.repo.findPendingApplication(input.playerId);
    if (pending) {
      throw new DomainError(
        "APPLICATION_ALREADY_PENDING",
        "You already have an application awaiting a decision.",
        { applicationId: pending.id },
      );
    }

    const decisionAt = calculateDecisionAt(input.now, input.randomUnit);
    return this.repo.createApplication({
      playerId: input.playerId,
      postingId: input.postingId,
      submittedAt: input.now,
      decisionAt,
    });
  }

  /**
   * Resolves every application whose decision delay has elapsed (spec
   * section 8.6, step 6). `drawRandomUnit` is injected (production callers
   * pass `Math.random`) so the sweep stays deterministic and testable,
   * matching `resolveApplicationAcceptance`'s own pre-drawn-random design.
   */
  async resolveDueDecisions(now: Date, drawRandomUnit: () => number): Promise<DecisionResolution[]> {
    const due = await this.repo.listApplicationsDueForDecision(now);
    const resolutions: DecisionResolution[] = [];

    for (const application of due) {
      const posting = await this.repo.getPostingById(application.postingId);
      if (!posting) continue;

      const template = employmentConfig.jobTemplates.find((t) => t.key === posting.templateKey);
      const availability: EmploymentAvailability = template?.availability ?? "low";
      const accepted = resolveApplicationAcceptance(availability, drawRandomUnit());
      const updated = await this.repo.updateApplicationDecision(
        application.id,
        accepted ? "ACCEPTED" : "REJECTED",
      );
      resolutions.push({ application: updated, posting, accepted });
    }

    return resolutions;
  }

  /**
   * Accepts an offer (spec section 8.6, steps 7-9). Replaces any existing
   * active employment rather than rejecting the accept - the one-job rule
   * (8.2, "accepting a new position replaces the current job after
   * confirmation") is enforced by `createOrReplaceEmployment`.
   */
  async acceptOffer(input: {
    playerId: PlayerId;
    applicationId: JobApplicationId;
    now: Date;
  }): Promise<PlayerEmployment> {
    const application = await this.repo.getApplication(input.applicationId);
    if (!application || application.playerId !== input.playerId || application.status !== "ACCEPTED") {
      throw new DomainError(
        "APPLICATION_NOT_ACCEPTED",
        "This application does not have an offer to accept.",
        { applicationId: input.applicationId },
      );
    }

    const posting = await this.repo.getPostingById(application.postingId);
    if (!posting) {
      throw new DomainError(
        "JOB_POSTING_UNAVAILABLE",
        "The posting behind this offer no longer exists.",
        { postingId: application.postingId },
      );
    }

    return this.repo.createOrReplaceEmployment({
      playerId: input.playerId,
      cityId: posting.cityId,
      postingId: posting.id,
      title: posting.title,
      dailyWageCents: posting.dailyWageCents,
      hiredAt: input.now,
      nextPayAt: calculateNextPayrollAt(input.now),
    });
  }

  async declineOffer(input: { playerId: PlayerId; applicationId: JobApplicationId }): Promise<void> {
    const application = await this.repo.getApplication(input.applicationId);
    if (!application || application.playerId !== input.playerId || application.status !== "ACCEPTED") {
      throw new DomainError(
        "APPLICATION_NOT_ACCEPTED",
        "This application does not have an offer to decline.",
        { applicationId: input.applicationId },
      );
    }
    await this.repo.updateApplicationDecision(application.id, "OFFER_DECLINED");
  }

  /**
   * Finds employments due for daily payroll and advances their schedule
   * (spec section 8.7). Advances from the employment's *previous*
   * `nextPayAt` rather than `now`, so a late-running sweep doesn't drift
   * the payroll schedule away from the configured local hour.
   */
  async runPayrollSweep(now: Date): Promise<PayrollDue[]> {
    const due = await this.repo.listEmploymentsDueForPayroll(now);
    const results: PayrollDue[] = [];

    for (const employment of due) {
      if (!isPayrollDue(employment.nextPayAt, now)) continue;
      const payDateKey = formatUtcDateKey(employment.nextPayAt);
      const nextPayAt = calculateNextPayrollAt(employment.nextPayAt);
      await this.repo.advancePayroll(employment.id, nextPayAt);
      results.push({ employment, payDateKey });
    }

    return results;
  }
}
