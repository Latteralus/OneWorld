# OneWorld
## Change Log and Alignment Notes

**Companion to:** `OneWorld_Master_Technical_Document.md` (the authoritative spec - this document never overrides it)
**Also see:** `../IMPLEMENTATION_STATUS.md` at the repo root for the current roadmap-phase snapshot

---

## Purpose

The master technical document defines *what OneWorld should be*. This document tracks *what has actually changed in the codebase over time*, and records the specific decisions made wherever the master document left something open, configurable, or subject to later balance testing (see its section 35, "Open Design Decisions").

Two documents, two jobs:

- **`IMPLEMENTATION_STATUS.md`** - a snapshot. "As of now, what roadmap items are done, partial, or missing." Gets overwritten as status changes.
- **This file** - a history. "What changed, when, and why." Entries are appended, not rewritten, so the reasoning behind a decision is never lost even after the code around it changes again.

If you are picking up this project after a gap, read this file top-to-bottom (newest first) before making changes - it will tell you what's already been decided and why, so you don't re-litigate a settled question or silently contradict an earlier choice.

## How to use this document

When you make a change that a future contributor (human or AI) would need context on to stay aligned with the spec, add an entry to the **Change History** section below, newest entry on top. A good entry includes:

- **Date** and a one-line summary.
- **Spec sections touched** (cite them, e.g. "section 7.2, 25.1").
- **What changed** - a few bullets, not a file-by-file diff (git history has that).
- **Decisions made**, especially anything resolving a section 35 open item - add or update the corresponding row in the **Decisions Log** below too.
- **Deviations from the spec**, if any, and why.
- **New gaps or TODOs surfaced**, if any weren't already tracked.

Keep entries factual and terse. This is a log, not a design document - if a decision needs real justification and discussion, that belongs in an architectural decision record (spec section 36 item 17) referenced from here.

---

## Decisions Log

Tracks resolution of the fifteen open items from spec section 35. "Resolved (placeholder)" means a concrete default now exists in code but is expected to move once balance testing (or real product decisions) happen - do not treat these as final tuning.

| # | Open item (section 35) | Status | Resolution |
|---|---|---|---|
| 1 | Starting personal/company balances | Resolved | $2,500 personal / $5,000 company, matching the spec's recommended defaults exactly (`economy.config.ts`). |
| 2 | Preview region vs. worldwide airports | Resolved (placeholder) | U.S.-only for the preview launch: `isPreviewEligible` (`@oneworld/data-import-airports`) gates on `airportConfig.previewCountryCodes` (`@oneworld/config`, currently `["US"]`) and active status. Verified against the live OurAirports export: 16,171 of 47,975 normalized airports are U.S. Untested against real curation/balance needs - may need narrowing (e.g. a handful of metro areas) or widening later. |
| 3 | Exact supported aircraft list | Resolved (placeholder) | The ten candidate aircraft from spec section 16.3 seeded as-is in `aircraft.config.ts`. Subject to simulator-availability testing. |
| 4 | Wet vs. dry rental model | Resolved | Wet (hourly, fuel included) chosen for preview clarity, per spec section 16.7's guidance to pick one. |
| 5 | Passenger rate / minimum fare | Resolved | $1.25/passenger-NM, $75 minimum fare - the spec's own recommended defaults (`job.config.ts`). |
| 6 | Airport activity gain/decay rates | Resolved (placeholder) | Decay: 1 point/hour toward a floor of 0. Untested against real play patterns. |
| 7 | Passenger generation interval/targets | Resolved (placeholder) | 15-minute interval, base rate 0.1 of the remaining gap per interval (`passenger.config.ts`). Untested. |
| 8 | PPL route-distance/passenger limits | **Open** | Only the onboarding-tutorial limit exists (`onboardingConfig.protections.firstFlightMaxRangeNm = 50`), not a general PPL route/passenger-count cap. |
| 9 | Application delay/acceptance rates | Resolved (placeholder) | 2-6 hour decision delay; acceptance rate by availability tier (0.55-0.97), per `employment.config.ts`. |
| 10 | Exact daily payroll time | Resolved (placeholder, **known bug**) | 09:00 fixed **UTC** hour. This does *not* correctly implement "Eastern Time, DST-aware" from section 8.7 - see the gap noted in `domain-employment`'s README and item below. Must be fixed before Phase 2 ships. |
| 11 | Rent grace period / housing-failure consequences | Partially resolved | 72-hour grace period set (`housing.config.ts`); the failure-consequence *state machine* is defined (`housingTenancyStates` in contracts) but no service implements the transitions yet. |
| 12 | Ground fuel: automatic vs. manual | Resolved | Automatic purchase on travel start, per `vehicle.config.ts` (`autoPurchaseFuelOnTravel: true`), matching the spec's preview-simplicity suggestion. |
| 13 | Tracker support: MSFS 2020 vs. 2024 | **Open** | The mock adapter is version-agnostic; no real SimConnect binding exists yet to make this decision concrete. |
| 14 | Telemetry storage-retention policy | Resolved (placeholder) | 30-day raw retention (`trackerConfig.telemetry.rawRetentionDays`). No aggregation/expiry job implemented yet - the config value has nothing enforcing it. |
| 15 | Required check-flight scenarios | **Open** | `requiresCheckFlight: boolean` exists per qualification; no scenario/route/condition definitions yet. |

## Known architectural gaps (carried forward until fixed)

- **Payroll timezone**: `calculateNextPayrollAt` in `@oneworld/domain-employment` uses a fixed UTC hour instead of a DST-aware conversion against `America/New_York`. Flagged in code and in that package's README. Must be fixed before Phase 2 (Employment and Recurring Economy) ships.
- **Worker locking**: `apps/worker`'s `Scheduler` has no distributed lock/claim mechanism (spec section 25.2). Fine for a single worker instance; required before running more than one.

---

## Change History

### 2026-07-29 - Vercel deployment fixes for `apps/web`

**Spec sections touched:** none - deployment infrastructure, not spec-governed
game rules.

**What changed:** first deploy attempt of `apps/web` to Vercel failed three
times in sequence, each fix surfacing the next problem:

1. **"No Output Directory named 'public' found."** Vercel couldn't
   auto-detect a single Next.js app from the monorepo root and fell back to
   treating the project as a static site (which defaults to expecting a
   `public` output folder; Next.js outputs to `.next`). Fixed by adding
   `apps/web/vercel.json` (`framework: "nextjs"`, plus `installCommand`/
   `buildCommand` overrides that `cd ../..` and run
   `pnpm turbo run build --filter=@oneworld/web`, per Vercel's documented
   pnpm/Turborepo monorepo pattern) and setting the Vercel project's Root
   Directory to `apps/web` (dashboard setting, not repo config - done by
   the user during project import).
2. **Lockfile/workspace-root ambiguity warning** during the now-succeeding
   local build ("Next.js inferred your workspace root... detected multiple
   lockfiles"), caused by a stray lockfile outside the repo on the dev
   machine. Harmless locally but a real risk on Vercel - a misdetected
   tracing root can silently drop workspace-package files from a
   serverless function's deployment bundle, producing a build that
   succeeds but crashes at runtime. Fixed by pinning
   `outputFileTracingRoot` explicitly in `apps/web/next.config.ts` to the
   monorepo root.
3. **`Error: Invalid environment configuration: DATABASE_URL: Required`**
   even with the variable correctly set in Vercel Project Settings.
   Turborepo 2.x only passes env vars through to a task's process that are
   explicitly declared in `turbo.json`; ours only declared `NODE_ENV`, so
   every other var (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) was
   silently stripped before `next build` ran - confirmed by Turborepo's own
   build warning naming every stripped var, and independently verified by
   reverting `turbo.json` alone and reproducing the identical failure with
   the same shell-exported env vars, then restoring it and confirming
   success. Fixed by adding every variable `@oneworld/config#loadEnv()`
   validates (`packages/config/src/env.ts`) to `turbo.json`'s `globalEnv`.

**Decisions made:** none resolving spec section 35 items.

**Deviations from the spec:** none.

**Gaps surfaced:**

- `apps/admin` isn't deployed yet and has no `vercel.json` of its own - it
  will need the same treatment (its own Vercel project, Root Directory
  `apps/admin`, `vercel.json` with a `--filter=@oneworld/admin` build)
  whenever it's ready to deploy.
- `turbo.json`'s `globalEnv` list must be kept in sync with
  `packages/config/src/env.ts`'s Zod schema by hand - adding a new env var
  to one without the other reproduces exactly the `DATABASE_URL` failure
  above, just for the new var instead.

### 2026-07-28 - Phase 1: Airport World and Player Onboarding

**Spec sections touched:** 6 (Onboarding), 7 (Accounts/Ledger), 9 (Housing),
10 (Vehicles), 11 (Location), 12 (Airport Catalog/Map), 17 (Qualifications),
20-24 (architecture/ownership/services), 26.3-26.4 (Dashboard, Airport
Browser), 28.1 (Auth), 32 (Phase 1 of the roadmap), 35 open item #2.

**What changed:**

- **Database**: generated the first real migration
  (`packages/db/migrations/0000_happy_karen_page.sql`) covering every
  Phase 0 table - `drizzle-kit` needed a bump from 0.30.1 to 0.31.10 to fix
  a NodeNext `.js`-extension module-resolution bug that made `generate`
  crash; no schema changes.
- **Airport import**: `@oneworld/data-import-airports` gained a real CSV
  parser (`parseCsv`), preview curation (`isPreviewEligible`), an
  orchestrator (`runAirportImport`), a Drizzle catalog writer
  (`DrizzleAirportCatalogRepository`), and a runnable script
  (`pnpm --filter @oneworld/data-import-airports import`). Verified against
  the live OurAirports export mirror, not just fixtures.
- **Airport catalog reads**: `@oneworld/domain-airports` gained
  `AirportService`/`DrizzleAirportRepository` - search/filter, get-by-id,
  and nearest-airports, plus `ensureGameState` for newly-imported airports.
- **Cities**: new `worldConfig.startingCities` (`@oneworld/config`, 5
  curated U.S. metro areas with linked airports) and
  `@oneworld/domain-locations`'s `CityService`, seeded via
  `pnpm --filter @oneworld/domain-locations seed`.
- **Player location**: `@oneworld/domain-locations`'s `LocationService`
  (get/set current location), backed by `DrizzleLocationRepository`.
- **Starting-asset grants**: added `HousingService.grantStartingResidence`/
  `getActiveResidence`, `VehicleService.grantStartingVehicle`/
  `getVehicleForPlayer`, `QualificationService.grantStartingQualification`,
  and `LedgerService.openAccount`/`listRecentEntries` to their respective
  domains, each with Drizzle + in-memory repositories and tests, following
  `domain-finance`'s existing layering pattern exactly.
- **Onboarding orchestration**: `@oneworld/domain-players` gained
  `PlayerService`, `OnboardingService` (composes finance/housing/vehicles/
  qualifications/locations - see that package's README for why this one
  domain is allowed to do that), and `runOnboardingTransaction`, which runs
  the whole grant inside one Postgres transaction.
- **Cross-domain transaction fix**: every `Drizzle*Repository` constructor
  across 9 files now accepts `@oneworld/db`'s new `DbOrTx` type instead of
  `Database` - TypeScript treated the two as incompatible even though
  they're interchangeable at runtime, which blocked composing several
  domains' repositories inside one `db.transaction(...)` callback. Fixed at
  the root (`packages/db/src/client.ts`) rather than casting around it in
  `OnboardingService`.
- **Web app**: Supabase Auth email/password sign-up/sign-in/sign-out via
  `@supabase/ssr` (cookie-based sessions, `middleware.ts` refreshes them);
  an onboarding wizard (`/onboarding`) driving `runOnboardingTransaction`;
  the dashboard (`/dashboard`) now reads real profile/location/balances/
  residence/vehicle/qualification/recent-transactions instead of config
  placeholders; an airport browser (`/airports`, search + MapLibre map +
  list) and detail page (`/airports/[id]`, nearby airports, map). Also
  fixed a real gap: Next.js only auto-loads `.env` files from its own app
  directory, not the monorepo root, so `apps/web` had no way to see
  `DATABASE_URL`/Supabase keys at build or runtime - `next.config.ts` now
  loads the root `.env` explicitly via `dotenv`.
- Small supporting additions: `@oneworld/utils#addDays`,
  `@oneworld/domain-finance#buildIdempotencyKey.startingFunds`, a new
  `USERNAME_TAKEN` domain error code, and
  `onboardingConfig.startingVehicle.statusScore` (the vehicle config had a
  string `statusContribution` label but no numeric score, unlike housing's
  residence types - added `1`, matching the "very poor" tier).

**Decisions made:** resolved section 35 open item #2 (see the Decisions Log
above) - U.S.-only preview, placeholder.

**Deviations from the spec:** none intentional.

**Process note:** two background subagents built the mechanical,
well-precedented parts of this session in parallel with the main work -
`domain-housing`/`domain-vehicles`' starting-grant services, and
`domain-qualifications`' starting-PPL grant service - each given the exact
`domain-finance` pattern to copy and verified (typecheck/test/lint) after
the fact rather than trusted blindly.

**Gaps surfaced:**

- No live Supabase/Postgres instance was available in this environment.
  Every new service has unit-test coverage against in-memory repositories,
  `apps/web` builds and its route tree (including auth redirects) was
  verified against a running `next start`, and the airport import script
  was run against the real OurAirports export - but nobody has run
  `pnpm db:migrate` against a real database, signed up a real user, or
  clicked through onboarding in a browser. Do that before treating Phase 1
  as field-verified.
- Auth is email/password only - no password reset, OAuth, or email
  verification UI. Acceptable for preview, not for a real launch.
- The OurAirports adapter has no "regional airport" or "international hub"
  mapping (carried over from Phase 0, now more visible - the U.S. preview
  catalog is entirely `small_airfield`/`local_airport`/`major_airport`).
  Flagged in `data-import-airports/SOURCES.md`; needs a separate
  size/scheduled-service heuristic, not yet built.
- Dashboard's "pilot hours" is a hardcoded `0.0 hrs` rather than a real
  read, since no flight can be logged until Phase 6 - accurate today, but
  will need `QualificationRepository`/`QualificationService` to gain a real
  hour-totals read before Phase 6 ships.

### 2026-07-28 - Phase 0: Repository and Architecture scaffold

**Spec sections touched:** 20 (Technical Architecture), 21 (Sources of Truth), 22 (Configuration Strategy), 23 (Core Database Model), 24 (Service Interfaces and Domain Events), 25 (Background Workers), 31 (Coding Standards), 32 (Phase 0 of the Implementation Roadmap), 36 (Instructions to the Implementing AI).

**What changed:**

- Stood up the full monorepo: pnpm workspaces + Turborepo, strict TypeScript, ESLint 9 (flat config), Prettier, Vitest, GitHub Actions CI.
- Built all `packages/` called for in section 20.2: `config`, `contracts`, `db`, `utils`, `testing`, `ui`, all 19 `domain-*` packages, and both `data-import-*` packages.
- Built all four `apps/`: `web` (Next.js dashboard skeleton), `admin` (Next.js, placeholder tool list), `worker` (job scheduler framework with all 11 section-25.1 jobs registered as documented no-ops), `tracker` (Electron shell with a working, tested `MockSimConnectAdapter`).
- Implemented real, tested pure business logic (not just types) in domain packages wherever the spec names a specific calculation in section 21.4: money (`@oneworld/utils`), great-circle distance, ledger posting/idempotency (`domain-finance`), travel duration/fare (`domain-travel`), vehicle fuel/mileage (`domain-vehicles`), passenger revenue (`domain-jobs`), airport passenger target/activity (`domain-airports`), passenger pool generation (`domain-passengers`), training eligibility (`domain-training`), status score (`domain-housing`), flight settlement (`domain-flights`), telemetry plausibility checks (`domain-telemetry`), employment acceptance/payroll timing (`domain-employment`).
- Drizzle schema covers every table in spec section 23.
- Created `IMPLEMENTATION_STATUS.md` and this change log, per spec section 36 item 16.

**Decisions made:** see the Decisions Log above - this session resolved (at least provisionally) items 1, 3, 4, 5, 6, 7, 9, 10 (with a known bug), 11 (partial), 12, and 14. Items 2, 8, 13, and 15 remain open.

**Deviations from the spec:** none intentional. Two implementation bugs were found and fixed during verification (not spec deviations, just mistakes corrected same-session): a Vitest cross-package config-loading pattern that failed under Node's native ESM loader, and a Drizzle column definition (`numeric` with an invalid `mode` option) that didn't match the library's actual API.

**Process note:** `pnpm format` was initially misconfigured (`--ignore-path .gitignore` silently disabled `.prettierignore`) and reformatted `OneWorld_Master_Technical_Document.md` before this was caught. The reformat was reverted via `git checkout` and the master document's content is unchanged from before this session. The `.prettierignore`/script bug is fixed so this cannot recur - see `.prettierignore` and the `format`/`format:check` scripts in the root `package.json`.

**Gaps surfaced:** all real logic implemented this session is Phase-0-appropriate (pure calculations); no domain has a full application/infrastructure service layer yet except `domain-finance` (which has both an in-memory and a Drizzle-backed `LedgerRepository`, built specifically to satisfy the Phase 0 exit criterion "a sample idempotent ledger transaction works"). See `IMPLEMENTATION_STATUS.md` for the complete per-phase breakdown.
