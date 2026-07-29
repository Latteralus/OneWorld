# OneWorld

Persistent multiplayer aviation career and life-simulation platform. Web
dashboard plus a Windows MSFS tracker, built around real flights, a
persistent shared world, and career progression through verified hours and
training.

The full product and technical specification lives in
[`ProjectDocumentation/OneWorld_Master_Technical_Document.md`](ProjectDocumentation/OneWorld_Master_Technical_Document.md) -
that document is the source of truth for game rules, architecture, and
scope. See [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) for what
is actually built versus planned, and
[`ProjectDocumentation/OneWorld_Change_Log.md`](ProjectDocumentation/OneWorld_Change_Log.md)
for a dated history of what changed, why, and how open spec decisions have
been resolved.

## Stack

- **Web dashboard**: Next.js App Router (`apps/web`)
- **Admin**: Next.js (`apps/admin`)
- **Worker**: Node.js recurring-job runner (`apps/worker`)
- **Tracker**: Electron Windows tray app bridging MSFS/SimConnect (`apps/tracker`)
- **Database**: Supabase-managed PostgreSQL, Drizzle ORM (`packages/db`)
- **Monorepo**: pnpm workspaces + Turborepo

## Repository layout

```text
apps/
  web/       Player-facing dashboard (Next.js)
  admin/     Administrative tools (Next.js)
  worker/    Recurring jobs, reconciliation, outbox dispatch
  tracker/   Windows desktop tracker (Electron)

packages/
  config/                  Typed, centralized configuration + env validation
  contracts/               Shared IDs, state machines, domain events, error codes
  db/                      Drizzle schema, migrations, Supabase clients
  utils/                   Money, geography/units, and time primitives
  testing/                 Shared Vitest config and fixtures
  ui/                      Shared React UI primitives
  domain-*/                One package per bounded domain (players, finance,
                            travel, jobs, aircraft, flights, telemetry, etc.)
                            - see each package's README for ownership
  data-import-airports/    Airport dataset import adapters
  data-import-aircraft/    Simulator aircraft mapping
```

Every domain package follows the same internal shape (spec section 20.3):
`domain/` (pure rules and types), `application/` (services), `infrastructure/`
(repository implementations). React components never contain authoritative
economic, travel, qualification, or passenger formulas (section 20.4) -
that logic lives in `domain-*` packages, imported by the apps.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable && corepack prepare pnpm --activate`, or `npm install -g pnpm`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) for local Postgres (optional for lint/typecheck/unit tests - required for `db:migrate` and any integration test that touches a real database)

## Setup

```bash
pnpm install
cp .env.example .env   # fill in real values; see comments in the file
```

## Common commands

```bash
pnpm dev            # run all apps in dev mode (Turborepo)
pnpm build           # build all apps/packages
pnpm lint            # ESLint across the monorepo
pnpm typecheck       # tsc --noEmit across the monorepo
pnpm test            # Vitest across the monorepo
pnpm format          # Prettier write
pnpm format:check    # Prettier check (CI)

pnpm db:generate     # generate SQL migrations from the Drizzle schema
pnpm db:migrate      # apply migrations to DATABASE_URL
pnpm db:studio       # inspect data with Drizzle Studio
```

Run a command against a single package with `pnpm --filter <name> <script>`,
e.g. `pnpm --filter @oneworld/domain-finance test`.

## Contributing conventions

- Strict TypeScript, no unexplained `any` (spec section 31.1).
- Money is always integer cents via `@oneworld/utils`'s `Cents` type -
  never raw floating-point dollars (section 31.2).
- All timestamps are stored and reasoned about in UTC; display timezone
  conversion happens at the edge (`@oneworld/domain-time`, section 5.2).
- Every domain package has a README documenting ownership, public API,
  state machine, key invariants, and testing instructions (section 31.5).
- Create migrations; never hand-edit a deployed schema (section 36 item 10).

## License

See [`LICENSE`](LICENSE).
