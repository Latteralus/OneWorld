# @oneworld/domain-passengers

Airport passenger pools, generation, and reservations (spec section 13, 21.2).

## Ownership

Authoritative owner of **waiting passengers** - `airport_passenger_pools`.
Passengers are aggregate counts in the preview, not named NPCs
(section 13.1) - there is deliberately no per-passenger entity here.

## Public API

```ts
import {
  calculatePassengersGeneratedThisInterval,
  canReservePassengers,
} from "@oneworld/domain-passengers";
```

## State machine

`WAITING -> RESERVED -> IN_FLIGHT -> DELIVERED`, plus
`RETURNED_TO_POOL` and `UNDER_REVIEW` (spec section 13.6). The state union
lives in `@oneworld/contracts` (`passengerStates`).

## Key invariants

- Pools must never go negative - `canReservePassengers` is the guard every
  reservation path must check before mutating the pool, and the actual
  mutation must happen atomically (a DB transaction/lock, section 13.5,
  27.4), not via a read-then-write from application code.
- Generation moves the waiting count toward the airport's adjusted target
  (owned jointly with `@oneworld/domain-airports`) and never overshoots it
  (section 13.4).

## Roadmap status

Phase 0 delivers the pure generation/reservation-guard math above. The
`PassengerService` (get pool, reserve, mark departed/delivered, return to
pool, regenerate - section 24.2) and its atomic repository land in
Phase 4 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-passengers test
```
