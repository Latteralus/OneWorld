import { getDb } from "@oneworld/db";
import { worldConfig } from "@oneworld/config";
import { CityService } from "../application/city.service.js";
import { DrizzleCityRepository } from "../infrastructure/city.repository.drizzle.js";

/**
 * Seeds the starting-city catalog (spec section 6.1, `worldConfig.startingCities`).
 * Run after the airport import (city-airport links resolve by ident against
 * the canonical `airports` table). Safe to run repeatedly.
 */
async function main() {
  const service = new CityService(new DrizzleCityRepository(getDb()));
  const cities = await service.seedStartingCities(worldConfig.startingCities);
  console.error(`Seeded ${cities.length} cities: ${cities.map((c) => c.name).join(", ")}`);
}

main().catch((error) => {
  console.error("City seed failed:", error);
  process.exit(1);
});
