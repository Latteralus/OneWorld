# @oneworld/domain-audit

Audit trail of administrative and compensating actions (spec section 28.3, 21.2).

## Ownership

Authoritative owner of **the audit trail** - `audit_log`. Every admin tool
action that touches player state (releasing a stuck lock, correcting a
balance, disabling an airport) must write here.

## Public API

```ts
import type { AuditLogEntry, CompensatingAction } from "@oneworld/domain-audit";
```

## Key invariants

- Money is never "fixed" by silently editing a balance - corrections go
  through `@oneworld/domain-finance`'s ledger as a normal (audited) entry,
  and the `CompensatingAction` record links to it (section 28.3).
- Audit entries are append-only, like ledger entries - no update/delete
  path should exist in the repository layer.

## Roadmap status

Phase 0 delivers the type contracts above. The admin application and its
compensating-action workflows land in Phase 8 per the implementation
roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-audit test
```
