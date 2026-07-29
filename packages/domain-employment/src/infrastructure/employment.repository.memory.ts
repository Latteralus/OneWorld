import type { CityId, EmploymentId, JobApplicationId, JobPostingId, PlayerId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";
import type {
  EmploymentRepository,
  JobApplication,
  JobApplicationDecision,
  JobPosting,
  PlayerEmployment,
} from "../domain/employment.types.js";

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `mem-${prefix}-${sequence}`;
}

interface JobTemplateRow {
  id: string;
  key: string;
  title: string;
  category: string;
  dailyWageCents: Cents;
}

/**
 * In-memory `EmploymentRepository` for unit tests and local prototyping
 * (spec section 20.4). The Postgres-backed implementation lives in
 * `employment.repository.drizzle.ts` and must uphold the same contract.
 */
export class InMemoryEmploymentRepository implements EmploymentRepository {
  private readonly templatesByKey = new Map<string, JobTemplateRow>();
  private readonly postings = new Map<string, JobPosting>();
  private readonly applications = new Map<string, JobApplication>();
  private readonly employments = new Map<string, PlayerEmployment>();

  async ensureJobTemplate(input: {
    key: string;
    title: string;
    category: string;
    dailyWageCents: Cents;
  }): Promise<string> {
    const existing = this.templatesByKey.get(input.key);
    if (existing) return existing.id;
    const row: JobTemplateRow = { id: nextId("job-template"), ...input };
    this.templatesByKey.set(input.key, row);
    return row.id;
  }

  async ensurePosting(input: {
    cityId: CityId;
    templateId: string;
    templateKey: string;
    title: string;
    dailyWageCents: Cents;
    openings: number;
    expiresAt?: Date;
  }): Promise<JobPosting> {
    const existing = [...this.postings.values()].find(
      (p) => p.cityId === input.cityId && p.templateKey === input.templateKey && p.status === "OPEN",
    );
    if (existing) return existing;

    const posting: JobPosting = {
      id: nextId("posting") as JobPostingId,
      cityId: input.cityId,
      templateKey: input.templateKey,
      title: input.title,
      dailyWageCents: input.dailyWageCents,
      openings: input.openings,
      status: "OPEN",
      expiresAt: input.expiresAt,
    };
    this.postings.set(posting.id, posting);
    return posting;
  }

  async listOpenPostings(cityId: CityId): Promise<JobPosting[]> {
    return [...this.postings.values()].filter((p) => p.cityId === cityId && p.status === "OPEN");
  }

  async getPostingById(postingId: JobPostingId): Promise<JobPosting | undefined> {
    return this.postings.get(postingId);
  }

  async findPendingApplication(playerId: PlayerId): Promise<JobApplication | undefined> {
    return [...this.applications.values()].find(
      (a) => a.playerId === playerId && a.status === "PENDING",
    );
  }

  async createApplication(input: {
    playerId: PlayerId;
    postingId: JobPostingId;
    submittedAt: Date;
    decisionAt: Date;
  }): Promise<JobApplication> {
    const application: JobApplication = {
      id: nextId("application") as JobApplicationId,
      playerId: input.playerId,
      postingId: input.postingId,
      status: "PENDING",
      submittedAt: input.submittedAt,
      decisionAt: input.decisionAt,
    };
    this.applications.set(application.id, application);
    return application;
  }

  async getApplication(applicationId: JobApplicationId): Promise<JobApplication | undefined> {
    return this.applications.get(applicationId);
  }

  async listApplicationsDueForDecision(now: Date): Promise<JobApplication[]> {
    return [...this.applications.values()].filter(
      (a) => a.status === "PENDING" && a.decisionAt !== undefined && a.decisionAt.getTime() <= now.getTime(),
    );
  }

  async updateApplicationDecision(
    applicationId: JobApplicationId,
    status: JobApplicationDecision,
  ): Promise<JobApplication> {
    const existing = this.applications.get(applicationId);
    if (!existing) throw new Error(`Unknown application: ${applicationId}`);
    const updated: JobApplication = { ...existing, status };
    this.applications.set(applicationId, updated);
    return updated;
  }

  async getActiveEmployment(playerId: PlayerId): Promise<PlayerEmployment | undefined> {
    return [...this.employments.values()].find((e) => e.playerId === playerId && e.status === "ACTIVE");
  }

  async createOrReplaceEmployment(input: {
    playerId: PlayerId;
    cityId: CityId;
    postingId: JobPostingId;
    title: string;
    dailyWageCents: Cents;
    hiredAt: Date;
    nextPayAt: Date;
  }): Promise<PlayerEmployment> {
    for (const [id, employment] of this.employments) {
      if (employment.playerId === input.playerId && employment.status === "ACTIVE") {
        this.employments.set(id, { ...employment, status: "ENDED" });
      }
    }

    const employment: PlayerEmployment = {
      id: nextId("employment") as EmploymentId,
      playerId: input.playerId,
      cityId: input.cityId,
      title: input.title,
      dailyWageCents: input.dailyWageCents,
      nextPayAt: input.nextPayAt,
      status: "ACTIVE",
    };
    this.employments.set(employment.id, employment);
    return employment;
  }

  async listEmploymentsDueForPayroll(now: Date): Promise<PlayerEmployment[]> {
    return [...this.employments.values()].filter(
      (e) => e.status === "ACTIVE" && e.nextPayAt.getTime() <= now.getTime(),
    );
  }

  async advancePayroll(employmentId: EmploymentId, nextPayAt: Date): Promise<void> {
    const existing = this.employments.get(employmentId);
    if (!existing) throw new Error(`Unknown employment: ${employmentId}`);
    this.employments.set(employmentId, { ...existing, nextPayAt });
  }
}
