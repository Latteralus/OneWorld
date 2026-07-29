# @oneworld/domain-notifications

Player notification delivery (spec section 26.10, 21.2, `notifications` table in 23.10).

## Ownership

Authoritative owner of **notification delivery/read state**. Notifications
are produced as reactions to domain events (section 24.3) published by
other domains via the outbox - this domain never originates gameplay
facts, only communicates them.

## Public API

```ts
import type { Notification, NotifiableEventType } from "@oneworld/domain-notifications";
import { NotificationService, DrizzleNotificationRepository } from "@oneworld/domain-notifications";
```

## Key invariants

- Notification content is derived from a domain event; this domain must
  not duplicate business logic to decide _whether_ something happened,
  only _how to phrase it_ (section 34.5 applies the same principle to
  future life-simulation flavor).
- No system may require the player to leave a browser tab open to receive
  a notification (section 5.3) - delivery is driven by the outbox
  consumer, not a client subscription that must stay connected.

## Roadmap status

Phase 0 delivered the type contracts. Phase 2 adds
`NotificationService`/`DrizzleNotificationRepository` (insert-only) and
its first callers: the employment-decision and rent-distress worker-job
orchestrators create notifications directly rather than through an
outbox consumer, since no consumer exists yet - a deliberate scope cut
for Phase 2 (see the Phase 2 change log entry). The outbox consumer this
package's ownership section describes still doesn't exist; direct calls
are how notifications ship until it does.

## Testing

```bash
pnpm --filter @oneworld/domain-notifications test
```
