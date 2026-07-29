import type {
  CityId,
  EmploymentId,
  JobApplicationId,
  JobPostingId,
  PlayerId,
} from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";

export interface JobPosting {
  id: JobPostingId;
  cityId: CityId;
  templateKey: string;
  title: string;
  dailyWageCents: Cents;
  openings: number;
  status: "OPEN" | "CLOSED";
  expiresAt?: Date;
}

export interface JobApplication {
  id: JobApplicationId;
  playerId: PlayerId;
  postingId: JobPostingId;
  status: string; // see jobApplicationStates in @oneworld/contracts
  submittedAt: Date;
  decisionAt?: Date;
}

export interface PlayerEmployment {
  id: EmploymentId;
  playerId: PlayerId;
  cityId: CityId;
  title: string;
  dailyWageCents: Cents;
  nextPayAt: Date;
  status: "ACTIVE" | "ENDED";
}

export type JobApplicationDecision = "ACCEPTED" | "REJECTED" | "OFFER_DECLINED";

/** Repository interface owned by this domain (spec section 20.4). */
export interface EmploymentRepository {
  /** Select-then-insert-if-absent, matching this codebase's other `ensure*` catalog writers. */
  ensureJobTemplate(input: {
    key: string;
    title: string;
    category: string;
    dailyWageCents: Cents;
  }): Promise<string>;
  /** Returns the existing open posting for this city/template if one exists, else creates it. */
  ensurePosting(input: {
    cityId: CityId;
    templateId: string;
    templateKey: string;
    title: string;
    dailyWageCents: Cents;
    openings: number;
    expiresAt?: Date;
  }): Promise<JobPosting>;
  listOpenPostings(cityId: CityId): Promise<JobPosting[]>;
  getPostingById(postingId: JobPostingId): Promise<JobPosting | undefined>;
  findPendingApplication(playerId: PlayerId): Promise<JobApplication | undefined>;
  createApplication(input: {
    playerId: PlayerId;
    postingId: JobPostingId;
    submittedAt: Date;
    decisionAt: Date;
  }): Promise<JobApplication>;
  getApplication(applicationId: JobApplicationId): Promise<JobApplication | undefined>;
  listApplicationsDueForDecision(now: Date): Promise<JobApplication[]>;
  updateApplicationDecision(
    applicationId: JobApplicationId,
    status: JobApplicationDecision,
  ): Promise<JobApplication>;
  getActiveEmployment(playerId: PlayerId): Promise<PlayerEmployment | undefined>;
  /** Ends any existing `ACTIVE` employment for the player before inserting the new one (spec section 8.2's one-job rule). */
  createOrReplaceEmployment(input: {
    playerId: PlayerId;
    cityId: CityId;
    postingId: JobPostingId;
    title: string;
    dailyWageCents: Cents;
    hiredAt: Date;
    nextPayAt: Date;
  }): Promise<PlayerEmployment>;
  listEmploymentsDueForPayroll(now: Date): Promise<PlayerEmployment[]>;
  advancePayroll(employmentId: EmploymentId, nextPayAt: Date): Promise<void>;
}
