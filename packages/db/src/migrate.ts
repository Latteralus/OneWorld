import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadEnv } from "@oneworld/config";

/**
 * Applies pending SQL migrations from ./migrations. Run via `pnpm db:migrate`.
 * Never mutate production schemas manually (spec section 36 item 10).
 */
async function main() {
  const env = loadEnv();
  const sql = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  console.error(`Applying migrations to ${env.APP_ENV}...`);
  await migrate(db, { migrationsFolder: "./migrations" });
  console.error("Migrations applied.");

  await sql.end();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
