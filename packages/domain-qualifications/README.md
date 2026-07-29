# @oneworld/domain-qualifications

Pilot hours, licenses, and qualification eligibility records (spec section 17, 21.2).

## Ownership

Authoritative owner of **pilot hours** - `pilot_hour_totals`,
`flight_hour_entries`, and `player_qualifications`. Training _enrollment_
and eligibility _evaluation_ against these hours belong to
`@oneworld/domain-training`, which imports `PilotHourTotals` from here.

## Public API

```ts
import {
  applyHourIncrements,
  buildFlightHourIdempotencyKey,
} from "@oneworld/domain-qualifications";
import type { PilotHourTotals } from "@oneworld/domain-qualifications";
```

## Key invariants

- Only server-accepted tracker flights award hours (section 17.1) - hours
  are never incremented from client-reported data.
- Each category increment for a flight has its own idempotency key
  (`buildFlightHourIdempotencyKey`) so replaying the settlement worker
  cannot double-award hours (section 7.3).
- `applyHourIncrements` is pure and non-mutating - the persistence layer
  (Phase 6) is responsible for atomically writing the result.

## Roadmap status

Phase 0 delivers the pure hour-increment math above. Hour awarding wired
to flight completion lands in Phase 6; qualification awarding wired to
check flights lands in Phase 7, per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-qualifications test
```
