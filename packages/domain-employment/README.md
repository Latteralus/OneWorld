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
} from "@oneworld/domain-employment";
```

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
- Payroll math (`calculateNextPayrollAt`) currently uses a fixed UTC hour;
  it must become DST-aware against `America/New_York` before this ships
  (see the TODO in `employment.rules.ts`).
- The player receives pay while traveling or flying in the preview
  (section 8.7) - payroll eligibility never checks player location.

## Roadmap status

Phase 0 delivers the pure application/payroll math above. Postings,
applications, and the payroll worker land in Phase 2 per the
implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-employment test
```
