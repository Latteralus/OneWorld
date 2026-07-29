import type { PlayerId } from "@oneworld/contracts";
import type { DomainEventType } from "@oneworld/contracts";

export type NotificationType =
  | "flight_debrief"
  | "training_ready"
  | "employment_decision"
  | "rent_due"
  | "payroll_received"
  | "system";

export interface Notification {
  id: string;
  playerId: PlayerId;
  type: NotificationType;
  title: string;
  body: string;
  relatedType?: string;
  relatedId?: string;
  readState: boolean;
  createdAt: Date;
}

/** Maps a subset of domain events to the notification they should produce (spec section 24.3). */
export type NotifiableEventType = Extract<
  DomainEventType,
  | "FlightCompleted"
  | "FlightInvalidated"
  | "TrainingReadyForCheck"
  | "JobApplicationAccepted"
  | "JobApplicationRejected"
  | "RentCharged"
>;
