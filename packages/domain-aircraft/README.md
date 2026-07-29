# @oneworld/domain-aircraft

Aircraft catalog, simulator mappings, and rental reservations (spec section 16, 21.2).

## Ownership

Authoritative owner of **aircraft location and rental lock** -
`aircraft`, `aircraft_reservations`, and (catalog side) `aircraft_types` /
`simulator_aircraft_mappings`.

## Public API

```ts
import {
  calculateWetRentalCostCents,
  isAircraftAvailableForReservation,
} from "@oneworld/domain-aircraft";
```

## Key invariants

- One active renter/reservation at a time per aircraft (section 16.6) -
  `isAircraftAvailableForReservation` is the pre-check; the actual lock
  must be acquired atomically (section 27.4), not read-then-write.
- The preview uses a single rental pricing model (wet, hourly) for clarity
  (section 16.7, 35.4) - do not expose a dry-rate toggle without updating
  this README and the spec's open decision.
- Detection by the tracker of an installed simulator aircraft does not
  automatically approve it for paid jobs (section 16.1) - only a mapping
  with `verification_status` other than `unsupported` does.

## Roadmap status

Phase 0 delivers the pure rental-cost/availability math above. The
catalog, simulator mapping tables, and system rental fleet land in
Phase 5 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-aircraft test
```
