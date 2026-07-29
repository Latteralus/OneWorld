# OneWorld Implementation Status

Tracks the roadmap in `ProjectDocumentation/OneWorld_Master_Technical_Document.md`
section 32 against actual code, tests, and known gaps. Update this file
whenever a roadmap item's status changes - do not mark a phase complete
until its exit criteria pass (spec section 36 item 18).

Legend: ✅ done · 🟡 partial/scaffolded · ⬜ not started

---

## Phase 0 - Repository and Architecture

| Deliverable                            | Status | Notes                                                                                                                                                                                       |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo (pnpm workspaces + Turborepo) | ✅     | `pnpm-workspace.yaml`, `turbo.json`                                                                                                                                                         |
| Shared TypeScript configuration        | ✅     | `tsconfig.base.json`, strict mode                                                                                                                                                           |
| Linting/formatting/testing             | ✅     | ESLint 9 flat config, Prettier, Vitest (`@oneworld/testing`)                                                                                                                                |
| CI                                     | ✅     | `.github/workflows/ci.yml` - install, lint, typecheck, test, build                                                                                                                          |
| Environment validation                 | ✅     | `@oneworld/config#loadEnv()`, Zod-validated, fails fast                                                                                                                                     |
| Database and migrations                | 🟡     | Full Drizzle schema for all section-23 tables in `@oneworld/db`; no migrations generated yet (requires a running Postgres/Supabase instance - run `pnpm db:generate` once one is available) |
| Auth                                   | ⬜     | Supabase Auth client wiring exists (`@oneworld/db#getSupabaseBrowserClient/getSupabaseServiceClient`); no login flow yet                                                                    |
| Contracts package                      | ✅     | `@oneworld/contracts` - branded IDs, state machines, domain events, error codes                                                                                                             |
| Domain event/outbox foundation         | 🟡     | `domain_events` table + `DomainEvent` envelope type exist; outbox writer/dispatcher not implemented                                                                                         |
| Finance ledger foundation              | ✅     | `@oneworld/domain-finance` - `LedgerService`, idempotent posting, in-memory + Drizzle repositories, tested                                                                                  |
| Worker framework                       | ✅     | `@oneworld/worker` - `Scheduler`, structured logging, all 11 section-25.1 jobs registered as documented no-op placeholders                                                                  |
| Audit logging                          | 🟡     | `audit_log` table + `@oneworld/domain-audit` types exist; no write path yet                                                                                                                 |

**Exit criteria:**

- [x] All apps build (`pnpm build` - verify locally/CI; see note below).
- [x] Local development works from documented commands (each app/package README).
- [x] CI runs tests and migrations safely (migrations step is a no-op until Phase 1's first migration is generated).
- [x] A sample idempotent ledger transaction works - see
      `packages/domain-finance/src/__tests__/ledger.service.test.ts`
      ("is idempotent: replaying the same key does not duplicate money").

## Phase 1 - Airport World and Player Onboarding

| Deliverable                                | Status                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Airport importer and canonical catalog     | 🟡 `@oneworld/data-import-airports` has a working OurAirports adapter + tests; no scheduled import job yet |
| Preview airport selection                  | ⬜                                                                                                         |
| Cities and airport links                   | 🟡 schema exists (`cities`, `city_airports`); no service                                                   |
| Map and airport pages                      | ⬜                                                                                                         |
| Player creation                            | 🟡 types only (`@oneworld/domain-players`)                                                                 |
| Starting PPL, apartment, car, and balances | 🟡 config defaults exist (`@oneworld/config#onboardingConfig`); no grant service                           |
| Current location                           | 🟡 `@oneworld/domain-locations` guard rules + types; no persistence service                                |
| Dashboard                                  | 🟡 `apps/web` dashboard page renders config defaults as placeholder data                                   |

## Phase 2 - Employment and Recurring Economy

🟡 Pure math complete and tested: `@oneworld/domain-employment` (acceptance,
payroll timing), `@oneworld/domain-finance` (ledger). Postings,
applications, and the worker job bodies (`daily-payroll`, `weekly-rent`,
`weekly-vehicle-maintenance`, `employment-application-decision`) are
registered in `apps/worker` but still no-ops.

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
- **Known architectural gap**: `@oneworld/domain-employment`'s
  `calculateNextPayrollAt` uses a fixed UTC hour rather than a DST-aware
  `America/New_York` conversion - flagged in that package's README and in
  its source comment. Must be fixed before Phase 2 ships.
- **Known architectural gap**: the worker's `Scheduler` has no distributed
  locking/claim mechanism (spec section 25.2) - fine for a single worker
  instance, required before scaling to more than one.
