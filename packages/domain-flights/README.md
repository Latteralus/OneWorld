# @oneworld/domain-flights

Flight session lifecycle and settlement orchestration (spec section 18, 24.2, 21.2).

## Ownership

Authoritative owner of **flight validity, after telemetry validation** -
`flight_sessions` and `flight_summaries`. Raw telemetry itself is owned by
`@oneworld/domain-telemetry`; this domain consumes validated telemetry
evidence and decides whether a flight is `ACCEPTED`, `INVALIDATED`, or
`UNDER_REVIEW`.

## Public API

```ts
import { calculateFlightSettlement } from "@oneworld/domain-flights";
```

## State machine

`IDLE_RAMP -> PREPARING -> TAXI_TAKEOFF -> EN_ROUTE -> TOUCHDOWN ->
TAXI_IN -> SHUTDOWN -> SUBMITTED`, resolving to `ACCEPTED`,
`INVALIDATED`, or `UNDER_REVIEW` (spec section 18.2). The state union
lives in `@oneworld/contracts` (`flightSessionStates`,
`flightSessionOutcomeStates`).

## Key invariants

- The tracker reports evidence; the server makes the authoritative
  validity decision (section 18.1, 21.3) - this domain never trusts a
  client-reported "flight succeeded" flag.
- `calculateFlightSettlement` is pure orchestration math - actually
  posting ledger entries (`@oneworld/domain-finance`) and awarding hours
  (`@oneworld/domain-qualifications`) happens in the Phase 6 completion
  service, atomically, exactly once per flight (section 14.6: "no
  individual step may silently succeed while the overall settlement is
  duplicated").
- An invalid flight pays nothing and explains why (roadmap Phase 6 exit
  criterion) - settlement is only computed for `ACCEPTED` sessions.

## Roadmap status

Phase 0 delivers the pure settlement math above. Session lifecycle,
telemetry-backed departure/arrival detection, and the full completion
pipeline land in Phase 5/6 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-flights test
```
