/**
 * Explicit state-machine definitions (spec section 31.1 item 13: "preserve
 * explicit state machines"). These are code configuration, not database
 * config (section 22.2), because changing them is a behavioral/deployment
 * decision.
 *
 * Each machine exports the ordered "happy path" states plus a separate
 * exceptional-states list, matching how the spec documents them.
 */

// --- Ground travel (section 11.5) ------------------------------------------
export const groundTravelStates = ["AVAILABLE", "PREPARING", "TRAVELING", "ARRIVED"] as const;
export const groundTravelExceptionalStates = [
  "CANCELLED",
  "INTERRUPTED",
  "FAILED",
  "UNDER_REVIEW",
] as const;
export type GroundTravelState =
  | (typeof groundTravelStates)[number]
  | (typeof groundTravelExceptionalStates)[number];

// --- Passenger reservation (section 13.6) -----------------------------------
export const passengerStates = ["WAITING", "RESERVED", "IN_FLIGHT", "DELIVERED"] as const;
export const passengerExceptionalStates = ["RETURNED_TO_POOL", "UNDER_REVIEW"] as const;
export type PassengerState =
  | (typeof passengerStates)[number]
  | (typeof passengerExceptionalStates)[number];

// --- Passenger job (section 14.5) -------------------------------------------
export const passengerJobStates = [
  "DRAFT",
  "QUOTED",
  "RESERVED",
  "PREPARING",
  "IN_FLIGHT",
  "COMPLETED",
] as const;
export const passengerJobExceptionalStates = [
  "CANCELLED",
  "EXPIRED",
  "INVALIDATED",
  "UNDER_REVIEW",
] as const;
export type PassengerJobState =
  | (typeof passengerJobStates)[number]
  | (typeof passengerJobExceptionalStates)[number];

// --- Flight session (section 18.2) ------------------------------------------
export const flightSessionStates = [
  "IDLE_RAMP",
  "PREPARING",
  "TAXI_TAKEOFF",
  "EN_ROUTE",
  "TOUCHDOWN",
  "TAXI_IN",
  "SHUTDOWN",
  "SUBMITTED",
] as const;
export const flightSessionOutcomeStates = ["ACCEPTED", "INVALIDATED", "UNDER_REVIEW"] as const;
export type FlightSessionState =
  | (typeof flightSessionStates)[number]
  | (typeof flightSessionOutcomeStates)[number];

// --- Training enrollment (section 17.4) -------------------------------------
export const trainingEnrollmentStates = [
  "ENROLLED",
  "IN_PROGRESS",
  "READY_FOR_CHECK_FLIGHT",
  "CHECK_FLIGHT_SCHEDULED",
  "COMPLETED",
] as const;
export const trainingEnrollmentExceptionalStates = ["CANCELLED", "FAILED_CHECK_FLIGHT"] as const;
export type TrainingEnrollmentState =
  | (typeof trainingEnrollmentStates)[number]
  | (typeof trainingEnrollmentExceptionalStates)[number];

// --- Employment application (section 8.6) -----------------------------------
export const jobApplicationStates = ["PENDING", "ACCEPTED", "REJECTED", "OFFER_DECLINED"] as const;
export type JobApplicationState = (typeof jobApplicationStates)[number];

// --- Housing tenancy (section 9.1) ------------------------------------------
export const housingTenancyStates = [
  "ACTIVE",
  "PAYMENT_DUE",
  "OVERDUE_GRACE_PERIOD",
  "EVICTION_PENDING",
  "TEMPORARY_LODGING",
  "UNHOUSED",
] as const;
export type HousingTenancyState = (typeof housingTenancyStates)[number];

// --- Player location (section 11.1) -----------------------------------------
export const playerLocationTypes = [
  "CITY_RESIDENCE",
  "AIRPORT",
  "IN_GROUND_TRANSIT",
  "IN_SIMULATOR_FLIGHT",
] as const;
export type PlayerLocationType = (typeof playerLocationTypes)[number];
