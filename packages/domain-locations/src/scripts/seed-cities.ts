import "@oneworld/config/load-dotenv";
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
  const db = getDb();
  const service = new CityService(new DrizzleCityRepository(db));
  const cities = await service.seedStartingCities(worldConfig.startingCities);
  console.error(`Seeded ${cities.length} cities: ${cities.map((c) => c.name).join(", ")}`);
  // getDb()'s postgres.js pool keeps its sockets open indefinitely, which
  // keeps this one-shot script's process alive after main() resolves -
  // close it explicitly so the process exits instead of hanging.
  await db.$client.end();
}

main().catch((error) => {
  console.error("City seed failed:", error);
  process.exit(1);
});
