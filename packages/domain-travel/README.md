# @oneworld/domain-travel

Ground travel quoting and the travel state machine (spec section 11, 24.2).

## Ownership

Authoritative owner of **active ground-travel state** and player location
transitions while traveling. `player_locations.location_type` moves to
`IN_GROUND_TRANSIT` only through this domain's application service (not
built yet - see below).

## Public API

```ts
import {
  estimateRoadDistanceMiles,
  calculateGroundTravelDurationMinutes,
  calculateBusDurationMinutes,
  calculateBusFareCents,
} from "@oneworld/domain-travel";
```

Fuel consumption for a trip is **not** calculated here - it's owned by
`@oneworld/domain-vehicles` (`calculateVehicleFuelUse`); this domain calls
that function rather than duplicating it (spec section 21.4).

## State machine

`AVAILABLE -> PREPARING -> TRAVELING -> ARRIVED`, plus `CANCELLED`,
`INTERRUPTED`, `FAILED`, `UNDER_REVIEW` (spec section 11.5). The state
union lives in `@oneworld/contracts` (`groundTravelStates`); this package
owns the transition logic.

## Key invariants

- Estimated road miles = great-circle miles × `travelConfig.roadDistanceMultiplier`
  until a real routing provider exists (section 11.3, 35.12).
- The player is moved to `IN_GROUND_TRANSIT` at departure and only to the
  destination on completion - never directly to the destination at start
  (section 11.5).
- Travel must complete without an open browser tab (section 5.3) - the
  worker's ground-travel-completion job (spec section 25.1) is
  authoritative, not a client timer.

## Roadmap status

Phase 0 delivers the pure quoting math above. The `TravelService`
(quote/start/complete/cancel, spec section 24.2) and its repository land in
Phase 3 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-travel test
```
