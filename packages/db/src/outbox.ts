import type { DomainEvent } from "@oneworld/contracts";
import type { DbOrTx } from "./client.js";
import { domainEvents } from "./schema/audit.js";

/**
 * Writes one event to the transactional outbox (spec section 24.4). Call
 * this inside the same transaction as the state change it describes, using
 * that write's own idempotency key - `domain_events.idempotency_key` is
 * unique-indexed, so replaying an already-published event is a silent
 * no-op rather than a duplicate row.
 *
 * No consumer/dispatcher reads this table yet (a documented gap, see
 * `IMPLEMENTATION_STATUS.md`); writers exist ahead of readers so state
 * changes are captured for audit now and a future publisher has real data
 * to work from.
 */
export async function insertDomainEvent(db: DbOrTx, event: DomainEvent): Promise<void> {
  await db
    .insert(domainEvents)
    .values({
      id: event.id,
      type: event.type,
      idempotencyKey: event.idempotencyKey,
      data: event.data,
      occurredAt: new Date(event.occurredAt),
    })
    .onConflictDoNothing();
}
