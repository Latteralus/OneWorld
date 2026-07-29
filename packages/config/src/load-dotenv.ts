import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

/**
 * Loads the monorepo's single root .env, for standalone Node scripts that
 * don't go through a bundler and so never see it otherwise (migrate.ts, the
 * airport import script, the city seed script, ...) - `import
 * "@oneworld/config/load-dotenv"` once at the top of the script, before
 * anything calls `loadEnv()`. A no-op when the file doesn't exist
 * (Vercel/CI, where vars come from the platform) or when a var is already
 * set in `process.env` (dotenv never overrides).
 *
 * Deliberately a separate entry point from the main `@oneworld/config`
 * barrel (which stays edge-safe): `node:path`/`node:url`/`dotenv` can't be
 * bundled for Next.js Middleware, which always runs on the Edge Runtime.
 * Next.js apps get their env from `next.config.ts`'s own dotenv load
 * instead (see apps/web/next.config.ts) - never import this module from
 * anything that might run there.
 */
const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
loadDotenv({ path: path.resolve(monorepoRoot, ".env") });
