# @oneworld/domain-players

Player profile, identity, and onboarding grants (spec section 6, 21.2).

## Ownership

Authoritative owner of **player profile identity** - `profiles`. Starting
asset _grants_ (PPL, apartment, car, balances) are orchestrated from here
but write into the domains that own each asset (`domain-housing`,
`domain-vehicles`, `domain-finance`, `domain-qualifications`) via their
public services, not directly.

## Public API

```ts
import type { PlayerProfile, CreatePlayerInput } from "@oneworld/domain-players";

import { runOnboardingTransaction } from "@oneworld/domain-players";
const result = await runOnboardingTransaction(getDb(), {
  authUserId,
  username,
  displayName,
  companyName,
  homeCityId,
  homeAirportId,
});
// result.alreadyOnboarded === true on a safe replay; otherwise every
// starting-asset id (accounts, residence, vehicle, qualification) is set.

import { PlayerService, DrizzlePlayerRepository } from "@oneworld/domain-players";
const players = new PlayerService(new DrizzlePlayerRepository(getDb()));
const profile = await players.getProfile(playerId);
```

## Key invariants

- Starting assets are granted exactly once per player (roadmap Phase 1
  exit criterion): `OnboardingService.completeOnboarding` checks for an
  existing profile before granting anything, and `runOnboardingTransaction`
  runs the whole grant inside one Postgres transaction so a failure
  partway through rolls back everything rather than leaving a player with
  some assets and not others.
- `profiles.id` matches the Supabase Auth user id (section 23.1) - this
  domain does not mint its own separate player ID.
- `OnboardingService` is the one place in the codebase that composes
  several domains' public services in a single call (finance, housing,
  vehicles, qualifications, locations) - it owns `PlayerCreated` and
  `StartingAssetsGranted` (spec section 24.3), so this composition is its
  job, not a layering violation (section 24.1: each of those services is
  still the only writer of its own tables).

## Roadmap status

Phase 0 delivered the type contracts. Phase 1 adds `PlayerService`,
`OnboardingService`, and `runOnboardingTransaction` - player creation and
the atomic starting-grant transaction called for by the roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-players test
```
