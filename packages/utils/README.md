# @oneworld/utils

Shared, unit-tested pure utilities with no domain knowledge (spec section 21.4).

## Ownership

Generic cross-domain primitives only:

- `money.ts` - integer-cents money arithmetic (section 31.2).
- `geo.ts` - `calculateGreatCircleDistanceNm`, the one shared distance primitive.
- `units.ts` - centralized unit conversions (section 31.3).
- `time.ts` - UTC helpers and idempotency-key date/week formatting.

Domain-specific calculations (`calculateVehicleFuelUse`, `calculatePassengerRevenue`,
`calculateTrainingEligibility`, etc.) do **not** live here - they belong in
the domain package that owns them and may import these primitives.

## Key invariants

- No floating-point dollar math anywhere in this package or its consumers -
  always operate on `Cents`.
- All distance/speed conversions go through `units.ts`; no ad hoc conversion
  constants elsewhere in the codebase.

## Testing

```bash
pnpm --filter @oneworld/utils test
```
