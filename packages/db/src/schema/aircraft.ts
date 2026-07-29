import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_helpers.js";

export const aircraftTypes = pgTable("aircraft_types", {
  id: idColumn(),
  icaoType: text("icao_type").notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  aircraftClass: text("aircraft_class").notNull(), // e.g. "single_engine_piston"
  engineCategory: text("engine_category").notNull(),
  totalSeats: integer("total_seats").notNull(),
  usablePassengerSeats: integer("usable_passenger_seats").notNull(),
  emptyWeightLb: doublePrecision("empty_weight_lb").notNull(),
  maxTakeoffWeightLb: doublePrecision("max_takeoff_weight_lb").notNull(),
  usableFuelGallons: doublePrecision("usable_fuel_gallons").notNull(),
  planningCruiseSpeedKts: doublePrecision("planning_cruise_speed_kts").notNull(),
  planningFuelBurnGph: doublePrecision("planning_fuel_burn_gph").notNull(),
  planningRangeNm: doublePrecision("planning_range_nm").notNull(),
  requiredQualification: text("required_qualification").notNull(),
  rentalRateModel: text("rental_rate_model").notNull().default("hourly_wet"),
  previewEnabled: boolean("preview_enabled").notNull().default(false),
});

export const simulatorAircraftMappings = pgTable("simulator_aircraft_mappings", {
  id: idColumn(),
  simulatorTitle: text("simulator_title").notNull(),
  packageName: text("package_name"),
  simulatorVersion: text("simulator_version"),
  aircraftTypeId: uuid("aircraft_type_id")
    .notNull()
    .references(() => aircraftTypes.id),
  verificationStatus: text("verification_status").notNull().default("automatically_inferred"),
  createdAt: createdAtColumn(),
});

export const aircraft = pgTable(
  "aircraft",
  {
    id: idColumn(),
    registration: text("registration").notNull(),
    aircraftTypeId: uuid("aircraft_type_id")
      .notNull()
      .references(() => aircraftTypes.id),
    ownerType: text("owner_type").notNull().default("system"), // "system" | "player" (future)
    ownerId: uuid("owner_id"),
    currentAirportId: uuid("current_airport_id"),
    fuelGallons: doublePrecision("fuel_gallons").notNull().default(0),
    airframeHours: doublePrecision("airframe_hours").notNull().default(0),
    condition: text("condition").notNull().default("good"),
    rentalAvailable: boolean("rental_available").notNull().default(true),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [uniqueIndex("aircraft_registration_idx").on(table.registration)],
);

export const aircraftReservations = pgTable("aircraft_reservations", {
  id: idColumn(),
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id),
  playerId: uuid("player_id").notNull(),
  jobId: uuid("job_id"),
  status: text("status").notNull().default("ACTIVE"),
  startedAt: createdAtColumn(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  version: integer("version").notNull().default(0),
});
