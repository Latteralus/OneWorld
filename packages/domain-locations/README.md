# @oneworld/domain-locations

Player current location and location state constraints (spec section 11.1, 23.2, 21.2).

## Ownership

Authoritative owner of **player current location** - `player_locations`.
Ground travel _transitions_ location but is owned by
`@oneworld/domain-travel`; this domain owns the resulting state and the
guard rules for what is allowed in each state.

## Public API

```ts
import { isPlayerAtAirport, canPerformLocationDependentAction } from "@oneworld/domain-locations";
import type { PlayerLocation } from "@oneworld/domain-locations";
```

## Key invariants

- A player can only begin a paid flight at the airport where they are
  physically located (section 11.1, 14.2) - `isPlayerAtAirport` is the one
  implementation of this check.
- The location type discriminated union enforces at compile time that only
  the fields valid for a given `locationType` are populated, matching the
  DB check constraint called for in section 23.2.
- While traveling, only informational browsing is allowed - no new travel,
  no flight start, no location-dependent purchases (section 11.6).

## Roadmap status

Phase 0 delivers the pure guard rules above. The location-update service,
wired to travel and flight completion, lands in Phase 1/3 per the
implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-locations test
```
