# @oneworld/domain-finance

Financial accounts and the immutable ledger (spec section 7, 24.2, 21.2).

## Ownership

Authoritative owner of **financial balances**. No other package may write
`ledger_entries` or `financial_accounts` directly - every domain that moves
money (employment payroll, housing rent, vehicle maintenance, flight
settlement, training tuition) calls `LedgerService.postEntry()`.

## Public API

```ts
import {
  LedgerService,
  DrizzleLedgerRepository,
  buildIdempotencyKey,
} from "@oneworld/domain-finance";

const ledger = new LedgerService(new DrizzleLedgerRepository(getDb()));

await ledger.postEntry({
  accountId,
  amountCents: cents(-80_000),
  category: "weekly_rent",
  description: "Weekly rent - Run-Down Apartment",
  idempotencyKey: buildIdempotencyKey.housingRent(tenancyId, isoWeekKey),
});
```

## State machine

Ledger entries are append-only and have no state machine - each is a
terminal fact. `financial_accounts.cached_balance_cents` is a derived
cache, reconciled against the ledger by the worker's reconciliation job
(spec section 25.3).

## Key invariants

- **Ledger-first accounting** (7.2): balances are never updated directly;
  every change is a `ledger_entries` row.
- **Idempotency** (7.3): `postEntry` is safe to call more than once with
  the same `idempotencyKey` - the second call returns the original entry
  unchanged. Use `buildIdempotencyKey` so every caller formats keys
  identically to the examples in the spec.
- Amounts are always `Cents` (`@oneworld/utils`), never floating-point
  dollars (section 31.2).
- The Postgres repository takes a row lock on the account (`FOR UPDATE`)
  inside a transaction so concurrent posts to the same account serialize
  (section 27.4).

## Testing

```bash
pnpm --filter @oneworld/domain-finance test
```

Unit tests run against `InMemoryLedgerRepository` (no database required).
Integration tests against a real Postgres instance, exercising
`DrizzleLedgerRepository`'s locking behavior under concurrency, are a
Phase 2 deliverable (spec section 30.2, roadmap Phase 2).
