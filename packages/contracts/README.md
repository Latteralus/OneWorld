# @oneworld/contracts

Shared TypeScript contracts consumed across web, worker, admin, tracker, and
every domain package (spec section 20.3: "Other packages import only from
the domain's public `index.ts` exports or the shared contracts package").

## Ownership

- Branded ID types (`ids.ts`) so entity IDs can't be swapped by accident.
- Explicit state-machine definitions (`state-machines.ts`) for every
  documented flow: ground travel, passenger reservation, passenger job,
  flight session, training enrollment, employment application, housing
  tenancy, player location.
- The domain event catalog (`events.ts`) and envelope type.
- Stable domain error codes and the `DomainError` class (`errors.ts`).

This package intentionally holds **no business logic** - only shapes and
enums that multiple domains need to agree on.

## Key invariants

- State machines here are the single source of truth for valid state
  values. Domain packages implement the *transition logic*; they import
  the state unions from here rather than redeclaring them.
- Adding a new domain event or error code is additive and reviewed like a
  public API change, since every consumer compiles against this package.

## Testing

```bash
pnpm --filter @oneworld/contracts test
```
