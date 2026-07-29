# @oneworld/domain-jobs

Passenger flight job quoting, validation, and lifecycle (spec section 14, 24.2).

## Ownership

Authoritative owner of **job state** (`passenger_jobs.status`). Reservation
of the underlying passenger pool is owned by `@oneworld/domain-passengers`;
this domain orchestrates the two but does not mutate the pool directly
(section 20.1 service boundary rule).

## Public API

```ts
import { calculatePassengerRevenueCents, buildPassengerJobQuote } from "@oneworld/domain-jobs";
```

## State machine

`DRAFT -> QUOTED -> RESERVED -> PREPARING -> IN_FLIGHT -> COMPLETED`, plus
`CANCELLED`, `EXPIRED`, `INVALIDATED`, `UNDER_REVIEW` (spec section 14.5).
The state union lives in `@oneworld/contracts` (`passengerJobStates`).

## Key invariants

- Gross revenue = `passengerCount * distanceNm * ratePerPassengerNm`,
  floored per-passenger at the configured minimum fare (section 14.3) -
  the one implementation of this formula (section 21.4).
- A quote is not a reservation - reserving passengers and the aircraft
  happens atomically in the job-reservation transaction (section 27.4),
  not in the pure quote calculation.
- Preview pricing intentionally excludes VIP/urgency/satisfaction/demand
  multipliers (section 14.3) - do not add them without updating this
  README and the spec.

## Roadmap status

Phase 0 delivers the pure quote math above. Full job validation
(section 14.2: location, license, aircraft availability, affordability)
and the `JobService` land in Phase 4/5 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-jobs test
```
