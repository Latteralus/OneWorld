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

/**
 * The type of the `tx` object `Database#transaction`'s callback receives.
 * Structurally a subset of `Database` (same query-builder surface, no
 * `$client`) - TypeScript treats them as distinct types even though every
 * repository in this codebase uses them interchangeably (spec section
 * 20.4: a repository takes "a `db`", real or transaction-scoped, so
 * several domains' repositories can be composed inside one shared
 * transaction). Repository constructors should accept `DbOrTx`, not
 * `Database`, so they work in both cases.
 */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DbOrTx = Database | Transaction;
