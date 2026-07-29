# @oneworld/db

Drizzle ORM schema, migrations, and database/Supabase clients (spec section 23).

## Ownership

This package owns the physical database schema and connection setup. It
does **not** own business rules - domain packages depend on `@oneworld/db`
for repository implementations, never the other way around (section 20.3
layering).

## Public API

```ts
import { getDb, schema } from "@oneworld/db";
import { getSupabaseBrowserClient, getSupabaseServiceClient } from "@oneworld/db";
```

- `getDb()` - memoized Drizzle client over `postgres-js`, typed with the
  full schema.
- `schema` - every table definition, grouped by the sections in the spec's
  data model (`schema/identity.ts`, `schema/airports.ts`, etc.).
- `getSupabaseBrowserClient()` / `getSupabaseServiceClient()` - Supabase
  Auth/Realtime/Storage clients. The service client is server-only and
  bypasses RLS, so callers must authorize before using it.

## Key invariants

- Every table that backs an idempotent operation (ledger entries, activity
  events, flight-hour entries, domain events) has a unique
  `idempotency_key` column - see section 7.3.
- `financial_accounts.cached_balance_cents` is a cache; `ledger_entries` is
  the source of truth and must be reconciled against, never overwritten
  directly (section 7.2, 23.1).
- Migrations are generated, never hand-edited: `pnpm db:generate` then
  `pnpm db:migrate`. Do not mutate schemas manually (section 36 item 10).

## Local development

```bash
# requires the Supabase CLI; see repo root README for setup
supabase start
pnpm db:generate   # writes SQL into ./migrations
pnpm db:migrate    # applies migrations to DATABASE_URL
pnpm db:studio     # inspect data with Drizzle Studio
```

## Testing

```bash
pnpm --filter @oneworld/db test
```

Schema tests are structural (no live database required). Integration tests
that exercise real transactions belong in the domain packages that own the
behavior (section 30.2), using a local Supabase/Postgres instance.
