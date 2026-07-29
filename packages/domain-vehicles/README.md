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
} from "@oneworld/domain-vehicles";
```

## Key invariants

- `fuel used = route miles / vehicle MPG` (section 10.4) - the single
  implementation of this formula.
- Mileage only increases via completed ground travel (section 10.3).
- Reaching `expectedLifespanMiles` does not force a breakdown in the
  preview (`vehicleConfig.breakdownsEnabled` is `false` by default,
  section 10.3) - lifespan fraction is tracked/displayed only.

## Roadmap status

Phase 0 delivers the pure vehicle math above. Vehicle purchase, ownership
records, and the weekly-maintenance worker integration land alongside
Phase 2/3 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-vehicles test
```
