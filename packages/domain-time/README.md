# @oneworld/domain-time

Authoritative server clock and game-time helpers (spec section 5, 21.2).

## Ownership

Authoritative owner of **current server time**. All other domains call
`serverNow()` instead of `new Date()` directly, so deadline logic is
mockable in tests and there's a single audited implementation of "now".

## Public API

```ts
import { serverNow, formatForDisplay, hasDeadlinePassed } from "@oneworld/domain-time";
```

## Key invariants

- OneWorld runs at a permanent 1:1 real-world time scale (section 5.1) -
  there is no game-speed multiplier to account for.
- All storage and comparisons happen in UTC; `formatForDisplay` is the only
  place a display timezone (`America/New_York` by default) is applied
  (section 5.2).
- Client clocks (browser, tracker) are evidence/display only, never
  authoritative (section 5.2) - never accept a client-reported timestamp
  as a deadline or completion time.
- `hasDeadlinePassed` exists so login/page-refresh can resolve any state
  whose completion time has passed (section 5.3) instead of relying on a
  client-side timer.

## Testing

```bash
pnpm --filter @oneworld/domain-time test
```
