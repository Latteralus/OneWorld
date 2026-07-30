# @oneworld/domain-vehicles

Owned vehicles, mileage, fuel, and maintenance (spec section 10, 21.2).

## Ownership

Authoritative owner of **vehicle mileage/fuel**. The travel domain calls
into this package to compute fuel use for a ground trip rather than
duplicating the formula (section 21.4).

## Public API

```ts
import {
  calculateVehicleFuelUseGallons,
  calculateVehicleFuelCostCents,
  calculateMileageAfterTrip,
  calculateLifespanFractionUsed,
  pickRandomStartingMileage,
  VehicleService,
  DrizzleVehicleRepository,
} from "@oneworld/domain-vehicles";
```

## Key invariants

- `fuel used = route miles / vehicle MPG` (section 10.4) - the single
  implementation of this formula.
- Mileage only increases via completed ground travel (section 10.3) -
  `recordTripDistance` is the one write path, called by
  `@oneworld/domain-travel`'s start-travel transaction.
- The preview auto-purchases exactly the fuel a trip burns
  (`vehicleConfig.autoPurchaseFuelOnTravel`), so `PlayerVehicle.fuelGallons`
  is unaffected by ground travel - manual refueling/gauge depletion is a
  later-phase feature (section 10.4's own "later" carve-out).
- Reaching `expectedLifespanMiles` does not force a breakdown in the
  preview (`vehicleConfig.breakdownsEnabled` is `false` by default,
  section 10.3) - lifespan fraction is tracked/displayed only.

## Roadmap status

Phase 0 delivered the pure vehicle math. Phase 1 added
`VehicleService.grantStartingVehicle`, the starting-vehicle grant used by
onboarding to give every new player their 1996 Hunda Attord exactly once,
fully fueled and owned outright. Phase 2 added
`listDueForMaintenance`/`recordMaintenanceOutcome`, driven by
`apps/worker/src/jobs/vehicle.job.ts`'s `weeklyVehicleMaintenanceJob` -
insufficient funds simply skips the charge and retries next sweep (no
debt, no penalty, consistent with `vehicleConfig.breakdownsEnabled: false`).
Phase 3 adds `recordTripDistance` plus `effectiveTravelSpeedMph`/
`fuelEfficiencyMpg` on `PlayerVehicle` (joined from `vehicle_types`, same
pattern as `weeklyMaintenanceCents`), consumed by
`@oneworld/domain-travel`'s ground-travel quoting/start transaction.
Purchase/resale flows still land later per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-vehicles test
```
