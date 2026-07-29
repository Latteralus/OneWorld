# @oneworld/domain-airports

Airport catalog, activity score, and route statistics (spec section 12, 15, 21.2).

## Ownership

Authoritative owner of **airport activity** - `airport_game_state` and
`route_statistics`. The canonical airport catalog rows themselves
(`airports` table) are populated by `@oneworld/data-import-airports`; this
domain owns the _game_ state layered on top (section 12.3: physical tier
vs. activity are deliberately separate).

## Public API

```ts
import {
  calculateAirportPassengerTarget,
  decayActivityScore,
  calculateActivityPointsForCompletedFlight,
} from "@oneworld/domain-airports";

import { AirportService, DrizzleAirportRepository } from "@oneworld/domain-airports";
const airports = new AirportService(new DrizzleAirportRepository(getDb()));
await airports.ensureGameState({ airportId, physicalTier }); // called once per imported airport
const results = await airports.search({ query: "denver", physicalTier: "major_airport" });
const nearby = await airports.listNearby(airport, 75, 8);
```

## Key invariants

- Physical tier (real-world size) and activity class (player-driven) are
  independent axes - a physically major airport can be "quiet" and a small
  airfield can be "busy" (section 12.3).
- Activity decay is bounded at a floor and never reduces the physical tier
  or erases historical totals (section 15.3).
- `calculateAirportPassengerTarget` is the single shared contract between
  the airport and passenger domains (section 21.4) - the passenger
  generation worker calls this rather than re-deriving targets.

## Roadmap status

Phase 0 delivered the pure activity/target math. Phase 1 adds
`AirportService`: `ensureGameState` (called by the import job for each
newly-catalogued airport), and the browse/search/nearby read path backing
the map and airport pages (spec section 26.4, 12.4). Passenger-pool
integration lands in Phase 4 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-airports test
```
