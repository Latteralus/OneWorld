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
| 10 | Exact daily payroll time | Resolved | 09:00 `America/New_York`, DST-aware via `@oneworld/utils#nextLocalHourInstantUtc` (fixed 2026-07-29 - see Phase 2 entry below; previously a known bug, fixed UTC hour). |
| 11 | Rent grace period / housing-failure consequences | Resolved (placeholder) | 72-hour grace period (`housing.config.ts`) applied at two escalation steps - `ACTIVE` → `PAYMENT_DUE` → `OVERDUE_GRACE_PERIOD` → `EVICTION_PENDING` → `TEMPORARY_LODGING` (billed at `temporaryLodgingWeeklyCostCents`) → `UNHOUSED` on the next missed payment - implemented in `domain-housing`'s `nextTenancyState`. A successful charge from any state jumps straight back to `ACTIVE`. Untested against real play patterns; the two-escalation-step timing is a placeholder, not a final balance decision. |
| 12 | Ground fuel: automatic vs. manual | Resolved | Automatic purchase on travel start, per `vehicle.config.ts` (`autoPurchaseFuelOnTravel: true`), matching the spec's preview-simplicity suggestion. |
| 13 | Tracker support: MSFS 2020 vs. 2024 | **Open** | The mock adapter is version-agnostic; no real SimConnect binding exists yet to make this decision concrete. |
| 14 | Telemetry storage-retention policy | Resolved (placeholder) | 30-day raw retention (`trackerConfig.telemetry.rawRetentionDays`). No aggregation/expiry job implemented yet - the config value has nothing enforcing it. |
| 15 | Required check-flight scenarios | **Open** | `requiresCheckFlight: boolean` exists per qualification; no scenario/route/condition definitions yet. |

## Known architectural gaps (carried forward until fixed)

- **Worker locking**: `apps/worker`'s `Scheduler` has no distributed lock/claim mechanism (spec section 25.2). Fine for a single worker instance; required before running more than one.
- **Outbox has writers, no reader**: every Phase 2 worker orchestrator writes to `domain_events` via `@oneworld/db#insertDomainEvent`, but no consumer/dispatcher processes the table yet. Notifications are created by direct calls from the orchestrators instead, not via an outbox-driven consumer - see the Phase 2 entry below.
- **No per-vehicle travel lock**: "vehicle cannot be reused while traveling" (Phase 3 exit criterion) currently relies on the one-vehicle-per-player game model (no purchase/multi-vehicle flow exists) plus the per-player active-travel guard in `@oneworld/domain-travel`'s `TravelService.startTravel`. A real per-vehicle lock (e.g. a partial unique index on `ground_travel(vehicle_id)`) is needed once multiple vehicle ownership ships - see the Phase 3 entry below.

---

## Change History

### 2026-07-29 - Phase 3: Ground Travel

**Spec sections touched:** 10 (Vehicle System), 11 (Ground Travel System),
24.2-24.4 (Services/Domain Events), 25.1 (Ground-Travel-Completion Worker
Job), 32 (Phase 3 of the roadmap).

**What changed:**

- **`@oneworld/domain-vehicles`**: `PlayerVehicle` gained
  `effectiveTravelSpeedMph`/`fuelEfficiencyMpg` (joined from
  `vehicle_types`, same pattern as `weeklyMaintenanceCents` from Phase 2)
  and `VehicleService.recordTripDistance` (advances mileage after a
  completed trip via the existing `calculateMileageAfterTrip`).
- **`@oneworld/domain-travel`**: gained its `application`/`infrastructure`
  layers - `TravelService` (`quoteTravel`, `startTravel`,
  `completeDueTravel`, all free of cross-domain writes, mirroring Phase
  2's Employment/Housing/Vehicle services), `Drizzle`/`InMemoryTravelRepository`,
  and the two-function composition root
  (`infrastructure/travel.transaction.ts`):
  `runStartGroundTravelTransaction` (location/one-trip/funds guards,
  ledger charge, mileage update, `IN_GROUND_TRANSIT` transition, all in
  one `db.transaction`, following `runOnboardingTransaction`'s pattern)
  and `runGroundTravelCompletionSweep` (moves arrived players to their
  destination). New pure rules: `calculateGroundTravelQuote` (composes
  the existing distance/duration/fare math plus
  `domain-vehicles`' fuel calculations), `doesLocationMatchOrigin` (the
  section-11.1 "must be at the origin" guard, which also doubles as the
  multiple-locations guard), `isTravelDue`, `toEndpointRef`.
- **`apps/worker`**: `ground-travel-completion` now calls
  `runGroundTravelCompletionSweep` instead of no-op'ing.
- Two new `buildIdempotencyKey` builders (`groundTravelFare`,
  `groundTravelFuel`) and one new domain error code (`NO_VEHICLE_OWNED`) -
  `TRAVEL_ALREADY_ACTIVE`, `ORIGIN_DESTINATION_SAME`,
  `PLAYER_NOT_AT_ORIGIN`, and `INSUFFICIENT_FUNDS` were all already
  defined (reserved from Phase 0) and unused until now.

**Decisions made:** no spec section 35 open items resolved (items #8,
#13, #15 remain open, untouched by ground travel). Several new
implementation-level placeholder decisions, none tracked in the
fifteen-item log since they're below that level of granularity:

- `PREPARING` is real but instantaneous - no async prep step exists in
  the preview; `startTravel` inserts `PREPARING` then immediately departs
  within the same call.
- A new flat `vehicleConfig.groundFuelPricePerGallonDollars` ($3.50)
  stands in for spec 10.4's "regional ground-fuel price" - no
  location-based pricing exists yet, and the airport-scoped
  `@oneworld/domain-fuel` system doesn't cover ground vehicles.
  Auto-purchased fuel funds exactly what a trip burns, so
  `PlayerVehicle.fuelGallons` is unaffected by ground travel.
  `playerVehicles.currentCityId` is likewise not updated by travel - not
  needed for this phase's exit criteria.
- Insufficient funds hard-rejects the whole start-travel transaction
  (unlike Phase 2's skip-and-retry recurring charges) - travel is
  voluntary and avoidable, so nothing is written on failure.
- No per-vehicle lock (see "Known architectural gaps" above) and no
  cancel/interrupt/failed/under-review handling (not required by the
  stated exit criteria).

**Deviations from the spec:** none intentional.

**Gaps surfaced:**

- No live Supabase/Postgres instance was available in this environment
  (same constraint as every prior phase). `TravelService`/rule logic has
  unit-test coverage against in-memory repositories; the two `run*Transaction`
  orchestrators and the worker job were reviewed against the existing
  schema but not exercised against a real database or a running worker
  process.
- No web UI was added for travel quoting/starting - Phase 3 delivered the
  backend services and worker job only, matching the precedent Phase 2
  set (no UI for job postings/rent/maintenance either) and documented
  there for the same reason: the roadmap's stated exit criteria are
  backend-verifiable without one.

### 2026-07-29 - Phase 2: Employment and Recurring Economy

**Spec sections touched:** 7 (Accounts/Ledger), 8 (Civilian Employment),
9 (Housing/Social Status), 10.5 (Vehicle Maintenance), 24.3-24.4 (Domain
Events/Outbox), 26.10 (Notifications), 32 (Phase 2 of the roadmap), 35
open items #10, #11.

**What changed:**

- **DST payroll fix (blocker)**: added `@oneworld/utils#nextLocalHourInstantUtc`
  (DST-aware local-hour → UTC-instant conversion via `Intl.DateTimeFormat`,
  re-resolving the offset if the candidate instant lands on the other side
  of a transition from the reference time) and rewired
  `domain-employment`'s `calculateNextPayrollAt` to use it against
  `gameClockConfig.defaultDisplayTimezone`. Tested across both 2026 U.S.
  DST transitions (2026-03-08 spring-forward, 2026-11-01 fall-back) -
  resolves section 35 open item #10, previously a known bug (fixed UTC
  hour).
- **`@oneworld/domain-employment`**: gained `EmploymentService` +
  `Drizzle`/`InMemoryEmploymentRepository`, following
  `domain-housing`/`domain-vehicles`' existing application/infrastructure
  shape. Covers job postings, applications (one pending at a time -
  `APPLICATION_ALREADY_PENDING`), the delayed-decision sweep
  (`resolveDueDecisions`), accept/decline (accepting always replaces any
  existing active job per the one-job rule, section 8.2, rather than
  blocking), and `runPayrollSweep` (determines who's owed pay, advances
  the schedule from the *previous* `nextPayAt` to avoid drift - the actual
  ledger post happens in the worker orchestrator, keeping "Finance domain
  writes the ledger entry, Employment domain determines whether pay is
  owed" from section 8.7 literal). Added a seed script
  (`pnpm world:seed-jobs`) that creates one long-lived posting per
  configured job template per starting city.
- **`@oneworld/domain-housing`**: added the full tenancy lifecycle -
  `calculateNextRentDueAt`/`calculateGraceDeadline`/`nextTenancyState`
  (pure rules) plus `HousingService.listDueForRentSweep`/`applyRentOutcome`.
  Resolves section 35 open item #11: `ACTIVE` → `PAYMENT_DUE` →
  `OVERDUE_GRACE_PERIOD` → `EVICTION_PENDING` → `TEMPORARY_LODGING` (billed
  separately) → `UNHOUSED`, with a successful charge from any state
  jumping straight back to `ACTIVE` - housing failure stays recoverable
  and never blocks flying, per section 9.1. `PlayerResidence` gained
  `weeklyRentCents`/`graceDeadlineAt` fields (joined from `residence_types`
  where needed).
- **`@oneworld/domain-vehicles`**: added
  `VehicleService.listDueForMaintenance`/`recordMaintenanceOutcome`.
  Simpler than housing's state machine by design - no vehicle state
  machine exists and `vehicleConfig.breakdownsEnabled` is `false`, so
  insufficient funds just skips the charge and retries next sweep, no
  debt or penalty. `PlayerVehicle` gained `weeklyMaintenanceCents`/
  `nextMaintenanceDueAt`; onboarding now seeds the first maintenance
  charge 7 days out, mirroring rent's first-week protection (section 6.6).
- **`@oneworld/db`**: added `insertDomainEvent` (thin outbox writer,
  idempotent via the existing unique index on `idempotency_key`) - now
  depends on `@oneworld/contracts` for the `DomainEvent` type.
- **`@oneworld/domain-notifications`**: gained its first real code -
  `NotificationService` (insert-only) and
  `Drizzle`/`InMemoryNotificationRepository`. No outbox consumer exists
  yet, so worker orchestrators call this directly rather than reacting to
  published events - a deliberate scope cut, not the long-term shape (see
  known gaps below).
- **`apps/worker`**: all four Phase 2 job bodies
  (`employment-application-decision`, `daily-payroll`, `weekly-rent`,
  `weekly-vehicle-maintenance`) now run real transactions instead of
  no-ops, each composing the relevant domain service(s) with
  `LedgerService`/`NotificationService`/`insertDomainEvent` against one
  shared `tx`, following `runOnboardingTransaction`'s pattern (`apps/worker/src/jobs/{employment,housing,vehicle}.job.ts`).
- Two new domain error codes: `JOB_POSTING_UNAVAILABLE`,
  `APPLICATION_NOT_ACCEPTED`.

**Decisions made:** resolved section 35 open items #10 (DST payroll,
fully resolved) and #11 (rent grace/eviction timing, resolved as a
placeholder - see the Decisions Log above for the exact escalation
timing chosen and why it's not final).

**Deviations from the spec:** none intentional. Notifications bypass the
outbox/consumer architecture described in `domain-notifications`' README
and called for in section 24.3-24.4 - orchestrators call
`NotificationService` directly. This is a scope cut for Phase 2, not a
reinterpretation of the design; building a real outbox consumer is
tracked as a known gap below.

**Gaps surfaced:**

- No live Supabase/Postgres instance was available in this environment
  (same constraint as Phase 0/1). Every new service has unit-test
  coverage against in-memory repositories and every Drizzle repository
  was reviewed against the existing schema (no migration needed - Phase 0
  already modeled every Phase 2 table), but nobody has run a worker
  process against a real database to watch a payroll/rent/maintenance
  sweep actually fire. Do that before treating Phase 2 as field-verified.
- The outbox has real writers now but still no reader - see "Known
  architectural gaps" above.
- No UI was added for job postings/applications/offers, rent/maintenance
  status, or notifications - Phase 2 delivered the backend services and
  worker jobs only, per the roadmap's phase boundary (`apps/web` UI for
  these is implicitly a later-phase or polish-pass concern, not called
  out as a Phase 2 deliverable in spec section 32).

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
  (`pnpm --filter @oneworld/data-import-airports import-airports`). Verified against
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
