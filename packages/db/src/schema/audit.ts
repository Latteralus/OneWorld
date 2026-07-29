import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn } from "./_helpers.js";

/**
 * Transactional outbox table (spec section 24.4). A row is written in the
 * same transaction as the state change it describes; a publisher process
 * reads and dispatches unpublished rows, then marks them published.
 */
export const domainEvents = pgTable(
  "domain_events",
  {
    id: idColumn(),
    type: text("type").notNull(), // see DomainEventType in @oneworld/contracts
    idempotencyKey: text("idempotency_key").notNull(),
    data: jsonb("data").notNull(),
    occurredAt: createdAtColumn(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("domain_events_idempotency_key_idx").on(table.idempotencyKey)],
);

export const auditLog = pgTable("audit_log", {
  id: idColumn(),
  actorId: uuid("actor_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  beforeSummary: jsonb("before_summary"),
  afterSummary: jsonb("after_summary"),
  requestId: text("request_id"),
  createdAt: createdAtColumn(),
});

export const notifications = pgTable("notifications", {
  id: idColumn(),
  playerId: uuid("player_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  relatedType: text("related_type"),
  relatedId: uuid("related_id"),
  readState: boolean("read_state").notNull().default(false),
  createdAt: createdAtColumn(),
});
