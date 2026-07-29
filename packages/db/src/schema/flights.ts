import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { centsColumn, createdAtColumn, idColumn } from "./_helpers.js";
import { aircraft } from "./aircraft.js";
import { profiles } from "./identity.js";
import { passengerJobs } from "./passengers.js";

export const flightSessions = pgTable("flight_sessions", {
  id: idColumn(),
  jobId: uuid("job_id").references(() => passengerJobs.id),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id),
  trackerInstallationId: uuid("tracker_installation_id"),
  status: text("status").notNull().default("IDLE_RAMP"),
  issuedAt: createdAtColumn(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  departedAt: timestamp("departed_at", { withTimezone: true }),
  landedAt: timestamp("landed_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  validatedAt: timestamp("validated_at", { withTimezone: true }),
  invalidReason: text("invalid_reason"),
});

export const flightSummaries = pgTable("flight_summaries", {
  flightSessionId: uuid("flight_session_id")
    .primaryKey()
    .references(() => flightSessions.id),
  distanceNm: doublePrecision("distance_nm"),
  durationMinutes: doublePrecision("duration_minutes"),
  fuelStartGallons: doublePrecision("fuel_start_gallons"),
  fuelEndGallons: doublePrecision("fuel_end_gallons"),
  fuelUsedGallons: doublePrecision("fuel_used_gallons"),
  landingRateFpm: doublePrecision("landing_rate_fpm"),
  originProximityNm: doublePrecision("origin_proximity_nm"),
  destinationProximityNm: doublePrecision("destination_proximity_nm"),
  maxSimRate: doublePrecision("max_sim_rate"),
  teleportFlag: boolean("teleport_flag").notNull().default(false),
  slewFlag: boolean("slew_flag").notNull().default(false),
  awardedHoursMinutes: integer("awarded_hours_minutes").notNull().default(0),
  grossRevenueCents: centsColumn("gross_revenue_cents"),
  totalCostsCents: centsColumn("total_costs_cents"),
  netCompanyIncomeCents: centsColumn("net_company_income_cents"),
});

export const telemetryBatches = pgTable("telemetry_batches", {
  id: idColumn(),
  flightSessionId: uuid("flight_session_id")
    .notNull()
    .references(() => flightSessions.id),
  sequenceStart: integer("sequence_start").notNull(),
  sequenceEnd: integer("sequence_end").notNull(),
  hash: text("hash").notNull(),
  payloadStorageRef: text("payload_storage_ref").notNull(),
  receivedAt: createdAtColumn(),
});
