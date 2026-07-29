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
```

## Key invariants

- Starting assets are granted exactly once per player (roadmap Phase 1
  exit criterion) - the onboarding service must be idempotent per player
  ID, not per request.
- `profiles.id` matches the Supabase Auth user id (section 23.1) - this
  domain does not mint its own separate player ID.

## Roadmap status

Phase 0 delivers the type contracts above. The onboarding/creation service
and its atomic starting-grant transaction land in Phase 1 per the
implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-players test
```
