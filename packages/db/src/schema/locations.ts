import { boolean, doublePrecision, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { idColumn, updatedAtColumn } from "./_helpers.js";
import { airports } from "./airports.js";

export const cities = pgTable("cities", {
  id: idColumn(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  countryCode: text("country_code").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  employmentTier: text("employment_tier").notNull().default("standard"),
  enabled: boolean("enabled").notNull().default(true),
});

export const cityAirports = pgTable(
  "city_airports",
  {
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),
    airportId: uuid("airport_id")
      .notNull()
      .references(() => airports.id),
    isPrimary: boolean("is_primary").notNull().default(false),
    surfaceDistanceMiles: doublePrecision("surface_distance_miles"),
  },
  (table) => [uniqueIndex("city_airports_city_airport_idx").on(table.cityId, table.airportId)],
);

/**
 * A player's single persistent location record (spec section 23.2). Use a
 * check constraint in the migration so only fields valid for
 * `locationType` are populated.
 */
export const playerLocations = pgTable("player_locations", {
  playerId: uuid("player_id").primaryKey(),
  locationType: text("location_type").notNull(), // see PlayerLocationType in @oneworld/contracts
  cityId: uuid("city_id").references(() => cities.id),
  airportId: uuid("airport_id").references(() => airports.id),
  activeTravelId: uuid("active_travel_id"),
  activeFlightId: uuid("active_flight_id"),
  updatedAt: updatedAtColumn(),
});
