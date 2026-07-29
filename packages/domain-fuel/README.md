# @oneworld/domain-fuel

Fuel quote provider interface for flight and ground-vehicle settlement (spec section 19, 21.2).

## Ownership

Authoritative owner of **fuel price/quote for a given airport**. The
flight/job system calls this interface - it must never read a hard-coded
airport fuel field directly (section 19.1).

## Public API

```ts
import { SystemFuelProvider, calculateFuelPurchaseCostCents } from "@oneworld/domain-fuel";
import type { FuelProvider, FuelQuote } from "@oneworld/domain-fuel";
```

`SystemFuelProvider` is the preview implementation: a configured price per
airport and effectively unlimited supply (section 19.1). A future
player-owned FBO provider implements the same `FuelProvider` interface
(section 19.3, 34.3) so flight settlement code never changes.

## Key invariants

- Settlement depends on the returned `FuelQuote`, never on how the
  provider computed it (section 19.3) - this is what lets FBO ownership
  attach later without touching flight/job code (section 34.3).
- `availableGallons: null` means unlimited supply; treat it distinctly
  from `0`, which means out of stock.

## Roadmap status

Phase 0 delivers the fuel-quote interface, pure cost math, and the system
provider. Wiring into flight settlement lands in Phase 5/6 per the
implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-fuel test
```
