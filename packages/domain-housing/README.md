# @oneworld/domain-housing

Residence tenancy, rent, and social status (spec section 9, 21.2).

## Ownership

Authoritative owner of **rent obligation** - `player_residences` and the
housing-tenancy state machine. Also owns the descriptive status-score
calculation (section 9.3), which reads vehicle/employment signals from
other domains but does not own them.

## Public API

```ts
import {
  calculateStatusScore,
  calculateNextRentDueAt,
  calculateGraceDeadline,
  nextTenancyState,
  HousingService,
  DrizzleHousingRepository,
} from "@oneworld/domain-housing";
```

`HousingService.listDueForRentSweep(now)` / `applyRentOutcome(...)` split
rent charging the same way `@oneworld/domain-employment`'s
`EmploymentService.runPayrollSweep` splits payroll: this domain never
moves money. The caller (a worker-job orchestrator composing this
service with `@oneworld/domain-finance`'s `LedgerService` inside one
transaction) checks the account balance, attempts the charge, then calls
`applyRentOutcome` to record whether it succeeded and let
`nextTenancyState` advance the tenancy state machine.

## State machine

`ACTIVE -> PAYMENT_DUE -> OVERDUE_GRACE_PERIOD -> EVICTION_PENDING`, with
`TEMPORARY_LODGING` and `UNHOUSED` as recoverable fallback states (spec
section 9.1). The state union lives in `@oneworld/contracts`
(`housingTenancyStates`).

## Key invariants

- Housing failure must always be recoverable - it may reduce status and
  add cost, but must never permanently block flying (section 9.1).
- Status is flavor/profile presentation only in the preview - it must not
  create large direct payout bonuses (section 9.3). `calculateStatusScore`
  returns a label, never money.
- Net worth (a separate numeric figure from status) is not calculated here
  - see spec section 9.3 for the formula, owned by the composing
    application layer once multiple domains' balances are available.

## Roadmap status

Phase 0 delivered the pure status-score math. Phase 1 added
`HousingService.grantStartingResidence`. Phase 2 adds the full tenancy
lifecycle: `listDueForRentSweep`/`applyRentOutcome` and the
`nextTenancyState` transition rules, driven by
`apps/worker/src/jobs/housing.job.ts`'s `weeklyRentJob`. The exact
grace/eviction timing (72h at each of two escalation steps before
`TEMPORARY_LODGING`, then `UNHOUSED` on the next missed payment) is a
placeholder decision - see the Phase 2 entry in
`ProjectDocumentation/OneWorld_Change_Log.md`.

## Testing

```bash
pnpm --filter @oneworld/domain-housing test
```
