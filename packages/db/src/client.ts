import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadEnv } from "@oneworld/config";
import * as schema from "./schema/index.js";

let cachedClient: ReturnType<typeof createClient> | undefined;

function createClient() {
  const env = loadEnv();
  const queryClient = postgres(env.DATABASE_URL, { prepare: false });
  return drizzle(queryClient, { schema });
}

/**
 * The single Drizzle client every server-side app/worker should use.
 * Domain packages accept a `db` instance through their repository
 * constructors rather than importing this directly, so tests can inject a
 * transaction or a test database (spec section 20.3/30.2).
 */
export function getDb() {
  if (!cachedClient) {
    cachedClient = createClient();
  }
  return cachedClient;
}

export type Database = ReturnType<typeof getDb>;
