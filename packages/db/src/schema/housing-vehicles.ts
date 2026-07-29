import { doublePrecision, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { centsColumn, createdAtColumn, idColumn } from "./_helpers.js";
import { profiles } from "./identity.js";
import { cities } from "./locations.js";
import { airports } from "./airports.js";

export const residenceTypes = pgTable("residence_types", {
  id: idColumn(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  quality: text("quality").notNull(),
  weeklyRentCents: centsColumn("weekly_rent_cents"),
  parkingCapacity: integer("parking_capacity").notNull().default(0),
  statusScore: integer("status_score").notNull().default(0),
});

export const playerResidences = pgTable("player_residences", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  residenceTypeId: uuid("residence_type_id")
    .notNull()
    .references(() => residenceTypes.id),
  cityId: uuid("city_id")
    .notNull()
    .references(() => cities.id),
  tenancyStatus: text("tenancy_status").notNull().default("ACTIVE"),
  nextRentDueAt: timestamp("next_rent_due_at", { withTimezone: true }).notNull(),
  graceDeadlineAt: timestamp("grace_deadline_at", { withTimezone: true }),
});

export const vehicleTypes = pgTable("vehicle_types", {
  id: idColumn(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  yearRange: text("year_range"),
  valueCents: centsColumn("value_cents"),
  speedMph: doublePrecision("speed_mph").notNull(),
  fuelEfficiencyMpg: doublePrecision("fuel_efficiency_mpg").notNull(),
  tankCapacityGallons: doublePrecision("tank_capacity_gallons").notNull(),
  expectedLifespanMiles: integer("expected_lifespan_miles").notNull(),
  weeklyMaintenanceCents: centsColumn("weekly_maintenance_cents"),
  quality: text("quality").notNull(),
  reliability: text("reliability").notNull(),
  statusScore: integer("status_score").notNull().default(0),
});

export const playerVehicles = pgTable("player_vehicles", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  vehicleTypeId: uuid("vehicle_type_id")
    .notNull()
    .references(() => vehicleTypes.id),
  currentCityId: uuid("current_city_id").references(() => cities.id),
  mileage: doublePrecision("mileage").notNull().default(0),
  fuelGallons: doublePrecision("fuel_gallons").notNull().default(0),
  condition: text("condition").notNull().default("good"),
  estimatedValueCents: centsColumn("estimated_value_cents"),
  nextMaintenanceDueAt: timestamp("next_maintenance_due_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
});

export const groundTravel = pgTable("ground_travel", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  mode: text("mode").notNull(), // "personal_vehicle" | "bus"
  vehicleId: uuid("vehicle_id").references(() => playerVehicles.id),
  originType: text("origin_type").notNull(),
  originCityId: uuid("origin_city_id").references(() => cities.id),
  originAirportId: uuid("origin_airport_id").references(() => airports.id),
  destinationType: text("destination_type").notNull(),
  destinationCityId: uuid("destination_city_id").references(() => cities.id),
  destinationAirportId: uuid("destination_airport_id").references(() => airports.id),
  distanceMiles: doublePrecision("distance_miles").notNull(),
  costCents: centsColumn("cost_cents"),
  fuelGallonsUsed: doublePrecision("fuel_gallons_used"),
  status: text("status").notNull().default("PREPARING"),
  departedAt: timestamp("departed_at", { withTimezone: true }),
  arrivesAt: timestamp("arrives_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
