/**
 * The initial domain-event set (spec section 24.3). Published via a
 * transactional outbox (24.4) so database state and event publication
 * cannot silently diverge. Consumers must be idempotent.
 */
export const domainEventTypes = [
  "PlayerCreated",
  "StartingAssetsGranted",
  "GroundTravelStarted",
  "GroundTravelCompleted",
  "JobPostingCreated",
  "JobApplicationSubmitted",
  "JobApplicationAccepted",
  "JobApplicationRejected",
  "PlayerEmployed",
  "DailyWageEarned",
  "PassengersReserved",
  "PassengerReservationExpired",
  "AircraftReserved",
  "FlightSessionCreated",
  "FlightDeparted",
  "FlightSubmitted",
  "FlightCompleted",
  "FlightInvalidated",
  "PassengersDelivered",
  "AircraftRelocated",
  "PilotHoursAwarded",
  "AirportActivityRecorded",
  "TrainingStarted",
  "TrainingReadyForCheck",
  "QualificationAwarded",
  "RentCharged",
  "VehicleMaintenanceCharged",
  "PaymentIssued",
] as const;

export type DomainEventType = (typeof domainEventTypes)[number];

/**
 * Envelope every published event shares. Payload shape is defined per
 * event type by the owning domain package and passed through the `data`
 * field so this package stays free of per-domain payload schemas.
 */
export interface DomainEvent<TType extends DomainEventType = DomainEventType, TData = unknown> {
  id: string;
  type: TType;
  occurredAt: string; // ISO 8601 UTC timestamp
  /** Idempotency/dedupe key for consumers, per section 7.3 / 24.4. */
  idempotencyKey: string;
  data: TData;
}
