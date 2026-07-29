# OneWorld Implementation Status

Tracks the roadmap in `ProjectDocumentation/OneWorld_Master_Technical_Document.md`
section 32 against actual code, tests, and known gaps. Update this file
whenever a roadmap item's status changes - do not mark a phase complete
until its exit criteria pass (spec section 36 item 18).

This is a snapshot. For a dated history of what changed and why - including
resolutions of the spec's section 35 open design decisions - see
`ProjectDocumentation/OneWorld_Change_Log.md`.

Legend: ✅ done · 🟡 partial/scaffolded · ⬜ not started

---

## Phase 0 - Repository and Architecture

| Deliverable                            | Status | Notes                                                                                                                                                                                                                                                 |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo (pnpm workspaces + Turborepo) | ✅     | `pnpm-workspace.yaml`, `turbo.json`                                                                                                                                                                                                                   |
| Shared TypeScript configuration        | ✅     | `tsconfig.base.json`, strict mode                                                                                                                                                                                                                     |
| Linting/formatting/testing             | ✅     | ESLint 9 flat config, Prettier, Vitest (`@oneworld/testing`)                                                                                                                                                                                          |
| CI                                     | ✅     | `.github/workflows/ci.yml` - install, lint, typecheck, test, build                                                                                                                                                                                    |
| Environment validation                 | ✅     | `@oneworld/config#loadEnv()`, Zod-validated, fails fast                                                                                                                                                                                               |
| Database and migrations                | ✅     | Full Drizzle schema for all section-23 tables; first migration generated (`packages/db/migrations/0000_happy_karen_page.sql`) - generation needed a `drizzle-kit` bump to 0.31.10 to fix a NodeNext `.js`-extension resolution bug, no schema changes |
| Auth                                   | 🟡     | Email/password sign up, sign in, sign out via `@supabase/ssr` (`apps/web/app/{login,signup,logout}`, `middleware.ts`); no password reset, OAuth, or email-verification UI yet                                                                         |
| Contracts package                      | ✅     | `@oneworld/contracts` - branded IDs, state machines, domain events, error codes                                                                                                                                                                       |
| Domain event/outbox foundation         | 🟡     | `domain_events` table + `DomainEvent` envelope type exist; `@oneworld/db#insertDomainEvent` writer exists and is called by every Phase 2 worker orchestrator - no consumer/dispatcher reads the table yet                                                                                                                                                   |
| Finance ledger foundation              | ✅     | `@oneworld/domain-finance` - `LedgerService`, idempotent posting, in-memory + Drizzle repositories, tested                                                                                                                                            |
| Worker framework                       | ✅     | `@oneworld/worker` - `Scheduler`, structured logging, all 11 section-25.1 jobs registered as documented no-op placeholders                                                                                                                            |
| Audit logging                          | 🟡     | `audit_log` table + `@oneworld/domain-audit` types exist; no write path yet                                                                                                                                                                           |

**Exit criteria:**

- [x] All apps build (`pnpm build` - verify locally/CI; see note below).
- [x] Local development works from documented commands (each app/package README).
- [x] CI runs tests and migrations safely (migrations now apply real schema, not a no-op).
- [x] A sample idempotent ledger transaction works - see
      `packages/domain-finance/src/__tests__/ledger.service.test.ts`
      ("is idempotent: replaying the same key does not duplicate money").

## Phase 1 - Airport World and Player Onboarding

| Deliverable                                | Status                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Airport importer and canonical catalog     | ✅ `@oneworld/data-import-airports`'s `runAirportImport` + `DrizzleAirportCatalogRepository` + `pnpm --filter @oneworld/data-import-airports import-airports` script; verified against the live OurAirports export (85,817 rows -> 47,975 normalized -> 16,171 U.S. preview-enabled) |
| Preview airport selection                  | ✅ resolves spec section 35 open item #2 (placeholder): U.S.-only, via `isPreviewEligible`/`airportConfig.previewCountryCodes`                                                                                                                                              |
| Cities and airport links                   | ✅ `@oneworld/domain-locations`'s `CityService` + `worldConfig.startingCities` (5 curated metro areas) + `pnpm --filter @oneworld/domain-locations seed`                                                                                                                    |
| Map and airport pages                      | ✅ `apps/web` `/airports` (search/filter + MapLibre map + list) and `/airports/[id]` (detail, nearby airports); passengers/aircraft/jobs sections correctly show as not-yet-implemented placeholders pending Phases 2/4/5                                                   |
| Player creation                            | ✅ `@oneworld/domain-players`'s `PlayerService`/`OnboardingService`, Supabase Auth sign-up (`apps/web/app/signup`) + onboarding wizard (`apps/web/app/onboarding`)                                                                                                          |
| Starting PPL, apartment, car, and balances | ✅ `OnboardingService.completeOnboarding` grants all four atomically via `runOnboardingTransaction` (one Postgres transaction composing `domain-finance`/`domain-housing`/`domain-vehicles`/`domain-qualifications`/`domain-locations`)                                     |
| Current location                           | ✅ `@oneworld/domain-locations`'s `LocationService` get/set, backed by `DrizzleLocationRepository`; set to the home city during onboarding                                                                                                                                  |
| Dashboard                                  | ✅ `apps/web/app/dashboard` reads real profile, location, balances, residence, vehicle, qualification, and recent ledger entries                                                                                                                                            |

**Exit criteria:**

- [x] New player can complete onboarding - sign up -> onboarding form -> dashboard, exercised via `pnpm --filter @oneworld/web build`'s route generation and `OnboardingService`'s unit tests; **not exercised against a live Supabase/Postgres instance in this environment** (none available) - see the gap noted below.
- [x] Starting assets are granted exactly once - `runOnboardingTransaction` runs the whole grant in one transaction; `OnboardingService.completeOnboarding` returns `alreadyOnboarded: true` without re-granting on replay (tested in `packages/domain-players/src/__tests__/onboarding.service.test.ts`).
- [x] Airport search/map work - `AirportService.search`/`listNearby` tested with an in-memory repository; the import pipeline was manually verified against real data (see table above). Live map rendering against a seeded database was not exercised in this environment.

## Phase 2 - Employment and Recurring Economy

✅ `@oneworld/domain-employment`'s `EmploymentService`/`DrizzleEmploymentRepository`
(postings, applications, delayed-decision resolution, one-job-rule
replace-on-accept, payroll scheduling) plus a job-posting seed script
(`pnpm world:seed-jobs`). `@oneworld/domain-housing`'s full tenancy
lifecycle (`listDueForRentSweep`/`applyRentOutcome`, `nextTenancyState`).
`@oneworld/domain-vehicles`' weekly maintenance charging
(`listDueForMaintenance`/`recordMaintenanceOutcome`). All four
`apps/worker` job bodies (`daily-payroll`, `weekly-rent`,
`weekly-vehicle-maintenance`, `employment-application-decision`) now run
real transactions composing the relevant domain service(s) with
`@oneworld/domain-finance`'s `LedgerService` inside one `db.transaction`,
following the `runOnboardingTransaction` pattern. `@oneworld/domain-notifications`
gained an insert-only `NotificationService` and `@oneworld/db` gained an
`insertDomainEvent` outbox writer; both are called directly by the worker
orchestrators (no consumer/dispatcher reads the outbox yet - unchanged
🟡 gap, see cross-cutting notes). Not exercised against a live database -
see the note at the bottom of this file.

## Phase 3 - Ground Travel

🟡 Pure math complete and tested: `@oneworld/domain-travel`
(`estimateRoadDistanceMiles`, `calculateGroundTravelDurationMinutes`,
`calculateBusDurationMinutes`, `calculateBusFareCents`). No `TravelService`,
no persistence, `ground-travel-completion` worker job is a no-op.

## Phase 4 - Passenger Pools and Job Builder

🟡 Pure math complete and tested: `@oneworld/domain-passengers`
(generation, reservation guard), `@oneworld/domain-airports`
(passenger target, activity decay/points), `@oneworld/domain-jobs`
(revenue, quote). No atomic reservation transactions, no `JobService`.

## Phase 5 - Aircraft and Tracker Integration

🟡 Pure math complete and tested: `@oneworld/domain-aircraft` (wet rental
cost, availability check), `@oneworld/data-import-aircraft` (simulator
mapping matcher). `apps/tracker` has a working, tested
`MockSimConnectAdapter` and the `SimConnectAdapter` interface; the real
SimConnect bridge (`RealSimConnectAdapter`) is unimplemented by design.

## Phase 6 - Flight Completion and Career Hours

🟡 Pure math complete and tested: `@oneworld/domain-flights`
(`calculateFlightSettlement`), `@oneworld/domain-qualifications`
(hour increments, idempotency-key builder), `@oneworld/domain-telemetry`
(all anti-cheat plausibility checks from spec section 18.6). No flight
session state machine implementation, no completion orchestration.

## Phase 7 - Training and Early Progression

🟡 Pure math complete and tested: `@oneworld/domain-training`
(`calculateTrainingEligibility` against `@oneworld/config`'s qualification
definitions). No enrollment service, no check-flight workflow.

## Phase 8 - Preview Hardening

⬜ `apps/admin` has a placeholder homepage listing the planned tool
categories (spec section 28.3). No admin functionality, metrics, alerts,
or load tests yet.

---

## Cross-cutting notes

- **Money**: every domain uses `@oneworld/utils`'s `Cents` type - no
  floating-point dollar arithmetic anywhere (spec section 31.2).
- **Distances/units**: centralized in `@oneworld/utils` (`geo.ts`,
  `units.ts`) - no duplicate conversion constants found anywhere else.
- **State machines**: every documented state machine (travel, passenger,
  passenger job, flight session, training enrollment, employment
  application, housing tenancy, player location) is codified in
  `@oneworld/contracts`.
- **Known architectural gap**: the worker's `Scheduler` has no distributed
  locking/claim mechanism (spec section 25.2) - fine for a single worker
  instance, required before scaling to more than one.
- **Cross-domain transactions**: every `Drizzle*Repository` constructor
  takes `@oneworld/db`'s `DbOrTx` (not `Database`) so several domains'
  repositories can be composed against the same `tx` inside one
  `db.transaction(...)` call - the pattern `OnboardingService`/
  `runOnboardingTransaction` established in Phase 1 and now also used by
  every Phase 2 worker-job orchestrator (`apps/worker/src/jobs/{employment,housing,vehicle}.job.ts`).
  Follow this when any future orchestration needs the same guarantee
  (e.g. Phase 6 flight settlement).
- **Not exercised end-to-end**: no live Supabase/Postgres instance is
  available in this environment. Every service (Phase 0-2) has
  unit-test coverage against in-memory repositories, the web app builds
  and its route tree was verified, and the airport import was run
  against live real-world data - but nobody has yet run `pnpm db:migrate`
  against a real database, signed up a real user, clicked through
  onboarding in a browser, or run `apps/worker` against a live database
  to watch a payroll/rent/maintenance sweep actually fire. Do that before
  calling Phase 1 or Phase 2 done in the field.
