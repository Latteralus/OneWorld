# @oneworld/config

Centralized, typed configuration for OneWorld (spec section 22).

## Ownership

This package owns:

- Validated process environment (`env.ts`).
- Balance/rule configuration that is safe to review and deploy as code
  (state machines, tolerances, curated seed lists).

It does **not** own live-tunable balance values meant for admin editing in
production (wages, rent, fuel price, passenger rates) - per section 22.2
those live in database-backed admin configuration once that system exists.
The values exported here are the documented preview defaults / seed data
used until that admin layer is built.

## Public API

Import from the package root:

```ts
import { loadEnv, economyConfig, onboardingConfig, jobConfig } from "@oneworld/config";
```

Every export is a `const` object with an inferred type (`typeof config`) so
consumers get compile-time safety without a parallel hand-written interface.

## Key invariants

- No other package should read `process.env` directly - always go through
  `loadEnv()` so missing/invalid configuration fails fast at boot.
- Config files contain no business logic, only values. Pure calculations
  that consume this config live in the domain package that owns them
  (section 21.4).

## Testing

```bash
pnpm --filter @oneworld/config test
```
