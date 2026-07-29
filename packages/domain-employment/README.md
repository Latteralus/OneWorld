# @oneworld/domain-employment

Civilian job postings, applications, and payroll (spec section 8, 24.2, 21.2).

## Ownership

Authoritative owner of **employment status** - `job_postings`,
`job_applications`, and `player_employment`.

## Public API

```ts
import {
  canHoldAdditionalJob,
  calculateDecisionAt,
  resolveApplicationAcceptance,
  calculateNextPayrollAt,
  isPayrollDue,
  EmploymentService,
  DrizzleEmploymentRepository,
} from "@oneworld/domain-employment";
```

`EmploymentService` composes the pure rules above against an
`EmploymentRepository`: `listOpenPostings`, `seedJobPostings` (one posting
per configured template per city - the seed script,
`pnpm --filter @oneworld/domain-employment seed`, runs this after
`@oneworld/domain-locations`' city seed), `submitApplication`,
`resolveDueDecisions` (the delayed-decision sweep), `acceptOffer` /
`declineOffer`, and `runPayrollSweep` (determines who's owed pay and
advances `nextPayAt` - the caller posts the actual ledger entry via
`@oneworld/domain-finance`'s `LedgerService`, per section 8.7).

## State machine

Applications: `PENDING -> ACCEPTED | REJECTED`, then `OFFER_DECLINED` if
the player turns down an accepted offer (spec section 8.6). The state
union lives in `@oneworld/contracts` (`jobApplicationStates`).

## Key invariants

- One-job rule: `canHoldAdditionalJob` must gate every hire, including the
  future large-airline employment path (section 8.2, 8.3).
- `resolveApplicationAcceptance` takes a pre-drawn random value rather than
  calling a RNG itself, so acceptance logic is deterministic and unit
  testable (section 30.1).
- Payroll math (`calculateNextPayrollAt`) is DST-aware against
  `America/New_York` via `@oneworld/utils`' `nextLocalHourInstantUtc`, so
  the UTC payroll instant shifts by one hour across a DST transition
  instead of drifting the wall-clock payroll time.
- The player receives pay while traveling or flying in the preview
  (section 8.7) - payroll eligibility never checks player location.
- `runPayrollSweep` advances `nextPayAt` from the employment's *previous*
  scheduled time, not `now`, so a late-running worker sweep doesn't drift
  the schedule.
- Applying while a decision is still pending is rejected
  (`APPLICATION_ALREADY_PENDING`) - not a spec requirement, but keeps the
  one-application-at-a-time flow simple; a player is free to apply again
  once decided.

## Roadmap status

Phase 0 delivered the pure application/payroll math. Phase 2 adds
`EmploymentService`/`DrizzleEmploymentRepository`, the job-posting seed
script, and the worker jobs that resolve application decisions and run
daily payroll (`apps/worker/src/jobs/employment.job.ts`).

## Testing

```bash
pnpm --filter @oneworld/domain-employment test
```
