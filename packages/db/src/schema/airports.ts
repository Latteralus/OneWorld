import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_helpers.js";

/**
 * Canonical airport catalog, populated by import adapters (spec section
 * 12.1) - never hand-entered. `sourceStatus` records data provenance.
 */
export const airports = pgTable(
  "airports",
  {
    id: idColumn(),
    ident: text("ident").notNull(),
    icao: text("icao"),
    localCode: text("local_code"),
    name: text("name").notNull(),
    municipality: text("municipality"),
    regionCode: text("region_code"),
    countryCode: text("country_code").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    elevationFt: integer("elevation_ft"),
    physicalTier: text("physical_tier").notNull(),
    sourceStatus: text("source_status").notNull().default("active"),
    previewEnabled: boolean("preview_enabled").notNull().default(false),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("airports_ident_idx").on(table.ident),
    index("airports_icao_idx").on(table.icao),
    index("airports_country_region_idx").on(table.countryCode, table.regionCode),
    index("airports_preview_enabled_idx").on(table.previewEnabled),
  ],
);

/** Player-driven game state, kept separate from real-world physical data (12.3). */
export const airportGameState = pgTable("airport_game_state", {
  airportId: uuid("airport_id")
    .primaryKey()
    .references(() => airports.id),
  activityScore: integer("activity_score").notNull().default(0),
  activityClass: text("activity_class").notNull().default("quiet"),
  basePassengerTarget: integer("base_passenger_target").notNull(),
  lastActivityAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const airportPassengerPools = pgTable("airport_passenger_pools", {
  airportId: uuid("airport_id")
    .primaryKey()
    .references(() => airports.id),
  waitingCount: integer("waiting_count").notNull().default(0),
  reservedCount: integer("reserved_count").notNull().default(0),
  inFlightCount: integer("in_flight_count").notNull().default(0),
  version: integer("version").notNull().default(0),
  updatedAt: updatedAtColumn(),
});

export const airportActivityEvents = pgTable(
  "airport_activity_events",
  {
    id: idColumn(),
    airportId: uuid("airport_id")
      .notNull()
      .references(() => airports.id),
    flightId: uuid("flight_id"),
    eventType: text("event_type").notNull(), // "departure" | "arrival" | "completion"
    passengerCount: integer("passenger_count").notNull().default(0),
    points: integer("points").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("airport_activity_events_idempotency_key_idx").on(table.idempotencyKey),
  ],
);

export const routeStatistics = pgTable(
  "route_statistics",
  {
    originAirportId: uuid("origin_airport_id")
      .notNull()
      .references(() => airports.id),
    destinationAirportId: uuid("destination_airport_id")
      .notNull()
      .references(() => airports.id),
    completedFlights: integer("completed_flights").notNull().default(0),
    passengersTransported: integer("passengers_transported").notNull().default(0),
    totalDurationMinutes: integer("total_duration_minutes").notNull().default(0),
    lastServedAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("route_statistics_origin_destination_idx").on(
      table.originAirportId,
      table.destinationAirportId,
    ),
  ],
);
