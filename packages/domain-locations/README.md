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

import { LocationService, DrizzleLocationRepository } from "@oneworld/domain-locations";
const locations = new LocationService(new DrizzleLocationRepository(getDb()));
await locations.setLocation({ playerId, locationType: "AIRPORT", airportId });

// City catalog (spec section 23.2) also lives here - a starting city links
// to the airports a new player may pick as their home airport.
import { CityService, DrizzleCityRepository } from "@oneworld/domain-locations";
const cities = new CityService(new DrizzleCityRepository(getDb()));
await cities.seedStartingCities(worldConfig.startingCities); // idempotent
const airports = await cities.listAirportsForCity(cityId);
```

Seed the starting cities from a terminal (run _after_ the airport import, so
`worldConfig.startingCities`' airport idents resolve):

```bash
pnpm --filter @oneworld/data-import-airports import
pnpm --filter @oneworld/domain-locations seed
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

Phase 0 delivered the pure guard rules. Phase 1 adds `LocationService`
(get/set current location, used by onboarding to place a new player at
their home city) and `CityService` (the starting-city/airport-link catalog
used by character creation). Wiring travel/flight completion to update
location automatically is Phase 3/6.

## Testing

```bash
pnpm --filter @oneworld/domain-locations test
```
