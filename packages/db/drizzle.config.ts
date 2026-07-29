import { defineConfig } from "drizzle-kit";
// Side-effect import: loads the monorepo root .env - "dotenv/config" alone
// only checks the current working directory, which is this package's own
// folder when run via `pnpm --filter @oneworld/db generate`, not the repo
// root where the real .env lives.
import "@oneworld/config/load-dotenv";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:54322/postgres",
  },
  strict: true,
  verbose: true,
});
