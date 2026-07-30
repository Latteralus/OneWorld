# @oneworld/domain-travel

Ground travel quoting and the travel state machine (spec section 11, 24.2).

## Ownership

Authoritative owner of **active ground-travel state** (`ground_travel`).
`player_locations.location_type` moves to `IN_GROUND_TRANSIT` and back
only through this domain's composition root
(`runStartGroundTravelTransaction`/`runGroundTravelCompletionSweep` in
`infrastructure/travel.transaction.ts`) - `TravelService` itself never
writes location, money, or vehicle state (see Key invariants).

## Public API

```ts
import {
  estimateRoadDistanceMiles,
  calculateGroundTravelDurationMinutes,
  calculateBusDurationMinutes,
  calculateBusFareCents,
  calculateGroundTravelQuote,
  doesLocationMatchOrigin,
  isTravelDue,
  TravelService,
  DrizzleTravelRepository,
  runStartGroundTravelTransaction,
  runGroundTravelCompletionSweep,
} from "@oneworld/domain-travel";
```

Fuel consumption for a trip is **not** calculated here - it's owned by
`@oneworld/domain-vehicles` (`calculateVehicleFuelUseGallons`/
`calculateVehicleFuelCostCents`); `calculateGroundTravelQuote` calls those
rather than duplicating them (spec section 21.4).

## State machine

`AVAILABLE -> PREPARING -> TRAVELING -> ARRIVED`, plus `CANCELLED`,
`INTERRUPTED`, `FAILED`, `UNDER_REVIEW` (spec section 11.5). The state
union lives in `@oneworld/contracts` (`groundTravelStates`/
`groundTravelExceptionalStates`); this package owns the transition logic.
`PREPARING` is exercised but instantaneous in the preview - no async prep
step exists yet, so `TravelService.startTravel` inserts `PREPARING` and
immediately marks `TRAVELING` within the same call. The exceptional
states aren't reachable yet (no cancel/interrupt/failed/under-review flow
is built) - a documented gap, not an oversight.

## Key invariants

- Estimated road miles = great-circle miles × `travelConfig.roadDistanceMultiplier`
  until a real routing provider exists (section 11.3, 35.12).
- Money, player location, and vehicle mileage never move inside
  `TravelService` - only `infrastructure/travel.transaction.ts`'s two
  exported functions compose those cross-domain writes, mirroring
  `@oneworld/domain-players`' `runOnboardingTransaction` and Phase 2's
  worker-job orchestrators (`apps/worker/src/jobs/{employment,housing,vehicle}.job.ts`).
- The player is moved to `IN_GROUND_TRANSIT` at departure and only to the
  destination on completion - never directly to the destination at start
  (section 11.5). `doesLocationMatchOrigin` is both the "must be
  physically at the origin" guard (11.1) and the multiple-locations guard,
  since `IN_GROUND_TRANSIT`/`IN_SIMULATOR_FLIGHT` never match a city/airport origin.
- Travel must complete without an open browser tab (section 5.3) - the
  worker's `ground-travel-completion` job calls
  `runGroundTravelCompletionSweep`, which is authoritative, not a client
  timer.
- "Vehicle cannot be reused while traveling" currently relies on the
  one-vehicle-per-player game model (no purchase/multi-vehicle flow
  exists) - the per-player active-travel guard in `TravelService.startTravel`
  is sufficient today. A real per-vehicle lock is needed once multiple
  vehicle ownership ships.
- Starting travel hard-rejects on insufficient funds (`INSUFFICIENT_FUNDS`)
  rather than skip-and-retry - unlike Phase 2's unavoidable recurring
  charges, travel is voluntary and avoidable.

## Roadmap status

Phase 0 delivered the pure quoting math. Phase 2 resolved section 35 open
items #10/#11 elsewhere (payroll/rent, unrelated to this package). Phase 3
adds `TravelService`, `Drizzle`/`InMemoryTravelRepository`, and the two
transaction functions, wired into `apps/worker/src/jobs/ground-travel.job.ts`.
No web UI ships this phase - matching the precedent Phase 2 set for
employment/rent/maintenance (see the Phase 3 change log entry).

## Testing

```bash
pnpm --filter @oneworld/domain-travel test
```
