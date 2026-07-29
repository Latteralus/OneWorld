# @oneworld/data-import-aircraft

Simulator aircraft mapping: matches installed MSFS titles/packages to
canonical OneWorld aircraft types (spec section 16.1, 16.4).

## Ownership

Owns the **matching algorithm** only. The resulting mappings are persisted
via `@oneworld/db`'s `simulator_aircraft_mappings` table; catalog
ownership (`aircraft_types`) is `@oneworld/domain-aircraft`.

## Public API

```ts
import { matchSimulatorAircraft } from "@oneworld/data-import-aircraft";
```

## Key invariants

- Detecting an installed aircraft never auto-approves it for paid jobs
  (section 16.1) - only `status !== "unsupported"` mappings may be used,
  and `automatically_inferred` mappings should be reviewed before wide
  trust (community-verified/official are the vetted tiers).
- Matching prefers an exact known-mapping title match, then falls back to
  an ICAO-type hint against the curated preview aircraft list
  (`@oneworld/config`'s `previewAircraftTypeSeeds`), then `unsupported`.

## Roadmap status

Phase 0 delivers the pure matching algorithm above. Tracker-side signal
collection and the admin review queue for inferred mappings land in
Phase 5 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/data-import-aircraft test
```
