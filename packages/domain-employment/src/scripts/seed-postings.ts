import "@oneworld/config/load-dotenv";
import { getDb, schema } from "@oneworld/db";
import type { CityId } from "@oneworld/contracts";
import { EmploymentService } from "../application/employment.service.js";
import { DrizzleEmploymentRepository } from "../infrastructure/employment.repository.drizzle.js";

/**
 * Seeds one long-lived job posting per configured template
 * (`employmentConfig.jobTemplates`) per city (spec section 8.5). Run after
 * `@oneworld/domain-locations`' city seed, since postings link to
 * already-seeded cities. Safe to run repeatedly.
 */
async function main() {
  const db = getDb();
  const cities = await db.select({ id: schema.cities.id }).from(schema.cities);
  const cityIds = cities.map((c) => c.id as CityId);

  const service = new EmploymentService(new DrizzleEmploymentRepository(db));
  const postings = await service.seedJobPostings(cityIds);
  console.error(`Seeded ${postings.length} job postings across ${cityIds.length} cities.`);

  // getDb()'s postgres.js pool keeps its sockets open indefinitely, which
  // keeps this one-shot script's process alive after main() resolves -
  // close it explicitly so the process exits instead of hanging.
  await db.$client.end();
}

main().catch((error) => {
  console.error("Job posting seed failed:", error);
  process.exit(1);
});
