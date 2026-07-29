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
