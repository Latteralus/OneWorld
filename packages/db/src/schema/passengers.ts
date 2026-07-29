import { doublePrecision, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { centsColumn, createdAtColumn, idColumn } from "./_helpers.js";
import { airports } from "./airports.js";
import { profiles } from "./identity.js";
import { aircraft } from "./aircraft.js";

export const passengerReservations = pgTable("passenger_reservations", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  originAirportId: uuid("origin_airport_id")
    .notNull()
    .references(() => airports.id),
  destinationAirportId: uuid("destination_airport_id")
    .notNull()
    .references(() => airports.id),
  passengerCount: integer("passenger_count").notNull(),
  aircraftId: uuid("aircraft_id").references(() => aircraft.id),
  status: text("status").notNull().default("RESERVED"),
  reservedAt: createdAtColumn(),
  expiresAt: createdAtColumn(),
  departedAt: timestamp("departed_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const passengerJobs = pgTable("passenger_jobs", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  reservationId: uuid("reservation_id").references(() => passengerReservations.id),
  originAirportId: uuid("origin_airport_id")
    .notNull()
    .references(() => airports.id),
  destinationAirportId: uuid("destination_airport_id")
    .notNull()
    .references(() => airports.id),
  aircraftId: uuid("aircraft_id").references(() => aircraft.id),
  passengerCount: integer("passenger_count").notNull(),
  distanceNm: doublePrecision("distance_nm").notNull(),
  quotedGrossRevenueCents: centsColumn("quoted_gross_revenue_cents"),
  quotedCosts: jsonb("quoted_costs_json").notNull().default({}),
  status: text("status").notNull().default("DRAFT"),
  createdAt: createdAtColumn(),
  expiresAt: createdAtColumn(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
