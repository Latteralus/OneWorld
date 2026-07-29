# @oneworld/admin

Administrative tools (spec section 28.3): player search, ledger viewer,
flight evidence review, stuck-lock release, reconciliation re-run, audited
compensating transactions, balance configuration, and account moderation.

Separate Next.js app (not a section of `@oneworld/web`) so admin access
control, deploy cadence, and blast radius stay isolated from the player-
facing product (spec section 28.1: "separate admin roles").

## Status

Phase 0 scaffolding only - the homepage lists the planned tool categories.
Real functionality lands in Phase 8 (Preview Hardening) per the
implementation roadmap, incrementally as each domain it inspects becomes
real (e.g. the ledger viewer can land once Phase 2's finance domain does).

## Local development

```bash
pnpm --filter @oneworld/admin dev
```

## Testing

```bash
pnpm --filter @oneworld/admin test
```
