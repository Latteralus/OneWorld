/**
 * Stable, typed domain error codes (spec section 31.4). UI layers translate
 * these codes into helpful messages; server code must never throw bare
 * strings for expected domain-rule failures.
 */
export const domainErrorCodes = [
  "PLAYER_NOT_AT_ORIGIN",
  "INSUFFICIENT_PASSENGERS",
  "AIRCRAFT_NOT_AVAILABLE",
  "QUALIFICATION_REQUIRED",
  "TRAVEL_ALREADY_ACTIVE",
  "FLIGHT_SESSION_INVALID",
  "INSUFFICIENT_FUNDS",
  "APPLICATION_ALREADY_PENDING",
  "EMPLOYMENT_SLOT_OCCUPIED",
  "AIRPORT_NOT_ENABLED",
  "AIRCRAFT_NOT_ENABLED",
  "ORIGIN_DESTINATION_SAME",
  "RESERVATION_EXPIRED",
  "IDEMPOTENCY_CONFLICT",
  "NOT_AUTHENTICATED",
  "NOT_AUTHORIZED",
  "USERNAME_TAKEN",
] as const;

export type DomainErrorCode = (typeof domainErrorCodes)[number];

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: DomainErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}
