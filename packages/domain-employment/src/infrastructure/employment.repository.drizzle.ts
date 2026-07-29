import { and, eq, lte } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { Cents } from "@oneworld/utils";
import type {
  CityId,
  EmploymentId,
  JobApplicationId,
  JobPostingId,
  PlayerId,
} from "@oneworld/contracts";
import type {
  EmploymentRepository,
  JobApplication,
  JobApplicationDecision,
  JobPosting,
  PlayerEmployment,
} from "../domain/employment.types.js";

function toDomainPosting(
  row: typeof schema.jobPostings.$inferSelect,
  template: { key: string; title: string },
): JobPosting {
  return {
    id: row.id as JobPostingId,
    cityId: row.cityId as CityId,
    templateKey: template.key,
    title: template.title,
    dailyWageCents: row.wageCents as Cents,
    openings: row.openings,
    status: row.status as "OPEN" | "CLOSED",
    expiresAt: row.expiresAt ?? undefined,
  };
}

function toDomainApplication(row: typeof schema.jobApplications.$inferSelect): JobApplication {
  return {
    id: row.id as JobApplicationId,
    playerId: row.playerId as PlayerId,
    postingId: row.postingId as JobPostingId,
    status: row.status,
    submittedAt: row.submittedAt,
    decisionAt: row.decisionAt ?? undefined,
  };
}

function toDomainEmployment(row: typeof schema.playerEmployment.$inferSelect): PlayerEmployment {
  return {
    id: row.id as EmploymentId,
    playerId: row.playerId as PlayerId,
    cityId: row.cityId as CityId,
    title: row.title,
    dailyWageCents: row.dailyWageCents as Cents,
    nextPayAt: row.nextPayAt,
    status: row.status as "ACTIVE" | "ENDED",
  };
}

/** Postgres-backed `EmploymentRepository`. */
export class DrizzleEmploymentRepository implements EmploymentRepository {
  constructor(private readonly db: DbOrTx) {}

  /** `job_templates.key` has no unique constraint in the schema, so this is a plain select-then-insert-if-absent. */
  async ensureJobTemplate(input: {
    key: string;
    title: string;
    category: string;
    dailyWageCents: Cents;
  }): Promise<string> {
    const [existing] = await this.db
      .select()
      .from(schema.jobTemplates)
      .where(eq(schema.jobTemplates.key, input.key));
    if (existing) return existing.id;

    const [inserted] = await this.db
      .insert(schema.jobTemplates)
      .values({
        key: input.key,
        title: input.title,
        category: input.category,
        baseDailyWageCents: input.dailyWageCents,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to create job template: ${input.key}`);
    return inserted.id;
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
    const [existing] = await this.db
      .select()
      .from(schema.jobPostings)
      .where(
        and(
          eq(schema.jobPostings.cityId, input.cityId),
          eq(schema.jobPostings.templateId, input.templateId),
          eq(schema.jobPostings.status, "OPEN"),
        ),
      );
    if (existing) return toDomainPosting(existing, { key: input.templateKey, title: input.title });

    const [inserted] = await this.db
      .insert(schema.jobPostings)
      .values({
        cityId: input.cityId,
        templateId: input.templateId,
        wageCents: input.dailyWageCents,
        openings: input.openings,
        status: "OPEN",
        expiresAt: input.expiresAt,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create job posting");
    return toDomainPosting(inserted, { key: input.templateKey, title: input.title });
  }

  async listOpenPostings(cityId: CityId): Promise<JobPosting[]> {
    const rows = await this.db
      .select({ posting: schema.jobPostings, template: schema.jobTemplates })
      .from(schema.jobPostings)
      .innerJoin(schema.jobTemplates, eq(schema.jobPostings.templateId, schema.jobTemplates.id))
      .where(and(eq(schema.jobPostings.cityId, cityId), eq(schema.jobPostings.status, "OPEN")));
    return rows.map((row) => toDomainPosting(row.posting, row.template));
  }

  async getPostingById(postingId: JobPostingId): Promise<JobPosting | undefined> {
    const [row] = await this.db
      .select({ posting: schema.jobPostings, template: schema.jobTemplates })
      .from(schema.jobPostings)
      .innerJoin(schema.jobTemplates, eq(schema.jobPostings.templateId, schema.jobTemplates.id))
      .where(eq(schema.jobPostings.id, postingId));
    return row ? toDomainPosting(row.posting, row.template) : undefined;
  }

  async findPendingApplication(playerId: PlayerId): Promise<JobApplication | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.jobApplications)
      .where(
        and(eq(schema.jobApplications.playerId, playerId), eq(schema.jobApplications.status, "PENDING")),
      );
    return row ? toDomainApplication(row) : undefined;
  }

  async createApplication(input: {
    playerId: PlayerId;
    postingId: JobPostingId;
    submittedAt: Date;
    decisionAt: Date;
  }): Promise<JobApplication> {
    const [inserted] = await this.db
      .insert(schema.jobApplications)
      .values({
        playerId: input.playerId,
        postingId: input.postingId,
        status: "PENDING",
        submittedAt: input.submittedAt,
        decisionAt: input.decisionAt,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create job application");
    return toDomainApplication(inserted);
  }

  async getApplication(applicationId: JobApplicationId): Promise<JobApplication | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.jobApplications)
      .where(eq(schema.jobApplications.id, applicationId));
    return row ? toDomainApplication(row) : undefined;
  }

  async listApplicationsDueForDecision(now: Date): Promise<JobApplication[]> {
    const rows = await this.db
      .select()
      .from(schema.jobApplications)
      .where(
        and(eq(schema.jobApplications.status, "PENDING"), lte(schema.jobApplications.decisionAt, now)),
      );
    return rows.map(toDomainApplication);
  }

  async updateApplicationDecision(
    applicationId: JobApplicationId,
    status: JobApplicationDecision,
  ): Promise<JobApplication> {
    const [updated] = await this.db
      .update(schema.jobApplications)
      .set({ status, determinedResult: status })
      .where(eq(schema.jobApplications.id, applicationId))
      .returning();
    if (!updated) throw new Error(`Unknown application: ${applicationId}`);
    return toDomainApplication(updated);
  }

  async getActiveEmployment(playerId: PlayerId): Promise<PlayerEmployment | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.playerEmployment)
      .where(
        and(eq(schema.playerEmployment.playerId, playerId), eq(schema.playerEmployment.status, "ACTIVE")),
      );
    return row ? toDomainEmployment(row) : undefined;
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
    await this.db
      .update(schema.playerEmployment)
      .set({ status: "ENDED", endedAt: input.hiredAt })
      .where(
        and(
          eq(schema.playerEmployment.playerId, input.playerId),
          eq(schema.playerEmployment.status, "ACTIVE"),
        ),
      );

    const [inserted] = await this.db
      .insert(schema.playerEmployment)
      .values({
        playerId: input.playerId,
        postingId: input.postingId,
        cityId: input.cityId,
        title: input.title,
        dailyWageCents: input.dailyWageCents,
        hiredAt: input.hiredAt,
        nextPayAt: input.nextPayAt,
        status: "ACTIVE",
      })
      .returning();
    if (!inserted) throw new Error("Failed to create player employment");
    return toDomainEmployment(inserted);
  }

  async listEmploymentsDueForPayroll(now: Date): Promise<PlayerEmployment[]> {
    const rows = await this.db
      .select()
      .from(schema.playerEmployment)
      .where(
        and(eq(schema.playerEmployment.status, "ACTIVE"), lte(schema.playerEmployment.nextPayAt, now)),
      );
    return rows.map(toDomainEmployment);
  }

  async advancePayroll(employmentId: EmploymentId, nextPayAt: Date): Promise<void> {
    await this.db
      .update(schema.playerEmployment)
      .set({ nextPayAt })
      .where(eq(schema.playerEmployment.id, employmentId));
  }
}
