import "@oneworld/config/load-dotenv";
import { getDb } from "@oneworld/db";
import { AirportService, DrizzleAirportRepository } from "@oneworld/domain-airports";
import { ourAirportsAdapter } from "../adapters/our-airports.adapter.js";
import { parseCsv } from "../csv.js";
import { runAirportImport } from "../import.js";
import { DrizzleAirportCatalogRepository } from "../infrastructure/airport-catalog.repository.drizzle.js";

/** Mirror of the OurAirports public export (see SOURCES.md) - overridable via env for testing/alternate sources. */
const DEFAULT_SOURCE_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv";

/**
 * Runnable airport-import job (spec section 12.1, 25.1). Not a Scheduler-registered
 * worker job (airport import isn't in the fixed section 25.1 job list) -
 * run manually or via an external cron: `pnpm --filter @oneworld/data-import-airports import-airports`.
 * Safe to run repeatedly.
 */
async function main() {
  const sourceUrl = process.env.AIRPORT_IMPORT_SOURCE_URL ?? DEFAULT_SOURCE_URL;
  console.error(`Fetching airport data from ${sourceUrl}...`);
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  const rows = parseCsv(csvText);
  console.error(`Parsed ${rows.length} rows.`);

  const db = getDb();
  const catalogRepo = new DrizzleAirportCatalogRepository(db);
  const airportService = new AirportService(new DrizzleAirportRepository(db));

  const summary = await runAirportImport(rows, ourAirportsAdapter, {
    upsertAirports: (records) => catalogRepo.upsertAirports(records),
    ensureGameStates: (inputs) => airportService.ensureGameStates(inputs),
  });

  console.error(`Import complete: ${JSON.stringify(summary)}`);
  // getDb()'s postgres.js pool keeps its sockets open indefinitely, which
  // keeps this one-shot script's process alive after main() resolves -
  // close it explicitly so the process exits instead of hanging.
  await db.$client.end();
}

main().catch((error) => {
  console.error("Airport import failed:", error);
  process.exit(1);
});
