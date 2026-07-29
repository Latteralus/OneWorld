import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { centsColumn, createdAtColumn, idColumn } from "./_helpers.js";
import { profiles } from "./identity.js";
import { flightSessions } from "./flights.js";

export const qualificationDefinitions = pgTable("qualification_definitions", {
  id: idColumn(),
  key: text("key").notNull(), // matches QualificationKey in @oneworld/config
  name: text("name").notNull(),
  type: text("type").notNull(), // "license" | "endorsement" | "rating"
  prerequisiteConfig: jsonb("prerequisite_config").notNull().default([]),
  tuitionCents: centsColumn("tuition_cents"),
  durationHours: integer("duration_hours").notNull().default(0),
  requiresCheckFlight: boolean("requires_check_flight").notNull().default(false),
  enabled: boolean("enabled").notNull().default(true),
});

export const playerQualifications = pgTable("player_qualifications", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  qualificationId: uuid("qualification_id")
    .notNull()
    .references(() => qualificationDefinitions.id),
  awardedAt: createdAtColumn(),
  sourceEnrollmentId: uuid("source_enrollment_id"),
  sourceCheckFlightId: uuid("source_check_flight_id").references(() => flightSessions.id),
});

/** Aggregated totals, maintained alongside the append-only `flight_hour_entries`. */
export const pilotHourTotals = pgTable("pilot_hour_totals", {
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  category: text("category").notNull(), // "total" | "pic" | "single_engine_piston" | ...
  minutes: integer("minutes").notNull().default(0),
  updatedAt: createdAtColumn(),
});

export const flightHourEntries = pgTable("flight_hour_entries", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  flightSessionId: uuid("flight_session_id")
    .notNull()
    .references(() => flightSessions.id),
  category: text("category").notNull(),
  minutes: integer("minutes").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  createdAt: createdAtColumn(),
});

export const trainingEnrollments = pgTable("training_enrollments", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  qualificationId: uuid("qualification_id")
    .notNull()
    .references(() => qualificationDefinitions.id),
  status: text("status").notNull().default("ENROLLED"),
  fundingAccountId: uuid("funding_account_id").notNull(),
  startedAt: createdAtColumn(),
  completesAt: timestamp("completes_at", { withTimezone: true }).notNull(),
  checkFlightId: uuid("check_flight_id").references(() => flightSessions.id),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
