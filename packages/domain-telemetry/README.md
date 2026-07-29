# @oneworld/domain-telemetry

Raw tracker telemetry ingestion and plausibility checks (spec section 18, 21.2).

## Ownership

Authoritative owner of **raw tracker evidence** - `telemetry_batches` and
the anti-cheat plausibility checks. `@oneworld/domain-flights` consumes
the _result_ of these checks to decide flight validity; it does not
re-implement them.

## Public API

```ts
import {
  isPlausibleGroundSpeed,
  isPlausibleSimRate,
  isImplausibleCoordinateJump,
  isWithinFuelTolerance,
  isPlausibleLandingRate,
} from "@oneworld/domain-telemetry";
```

## Key invariants

- The tracker reports evidence; the server decides validity (section 18.1,
  21.3) - these functions are the server-side decision logic, never
  bypassed by a client-reported "valid" flag.
- All thresholds come from `trackerConfig` (`@oneworld/config`), which is
  code configuration (not live-editable) per section 22.2 - anti-cheat
  tolerances are a deployment/review decision, not a live-tunable balance
  value.
- Do not automatically invalidate every network interruption (section
  18.6) - these checks flag samples/transitions, not entire sessions; the
  flight domain decides session-level outcomes.

## Roadmap status

Phase 0 delivers the pure plausibility checks above, matching the fixture
scenarios required by spec section 30.4 (normal flight, slew/teleport, sim
rate violation, fuel mismatch, hard landing). Batch ingestion, storage,
and retention land in Phase 5 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-telemetry test
```
