# @oneworld/domain-housing

Residence tenancy, rent, and social status (spec section 9, 21.2).

## Ownership

Authoritative owner of **rent obligation** - `player_residences` and the
housing-tenancy state machine. Also owns the descriptive status-score
calculation (section 9.3), which reads vehicle/employment signals from
other domains but does not own them.

## Public API

```ts
import { calculateStatusScore } from "@oneworld/domain-housing";
```

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

Phase 0 delivers the pure status-score math above. Tenancy records, the
rent worker, and eviction/grace-period handling land in Phase 2 per the
implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-housing test
```
