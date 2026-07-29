import { numeric, pgTable, text, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { centsColumn, createdAtColumn, idColumn, updatedAtColumn } from "./_helpers.js";

/**
 * Player profile. `id` is expected to match the Supabase Auth user id
 * (spec section 23.1) - not a separate generated key.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    companyName: text("company_name").notNull(),
    homeCityId: uuid("home_city_id"),
    homeAirportId: uuid("home_airport_id"),
    currentLocationType: text("current_location_type").notNull().default("CITY_RESIDENCE"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [uniqueIndex("profiles_username_idx").on(table.username)],
);

export const financialAccounts = pgTable("financial_accounts", {
  id: idColumn(),
  ownerType: text("owner_type").notNull(), // "player" | "company" | "system"
  ownerId: uuid("owner_id").notNull(),
  accountType: text("account_type").notNull(), // "personal" | "company"
  currency: text("currency").notNull().default("USD"),
  cachedBalanceCents: centsColumn("cached_balance_cents"),
  createdAt: createdAtColumn(),
});

/**
 * Immutable ledger - the single source of truth for money (spec section
 * 7.2). `cachedBalanceCents` on `financial_accounts` must be reconciled
 * against this table, never the other way around.
 */
export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: idColumn(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => financialAccounts.id),
    amountCents: centsColumn("amount_cents"), // signed
    category: text("category").notNull(),
    description: text("description").notNull(),
    relatedType: text("related_type"),
    relatedId: uuid("related_id"),
    idempotencyKey: text("idempotency_key").notNull(),
    effectiveAt: createdAtColumn(),
    createdAt: createdAtColumn(),
    balanceAfterCents: numeric("balance_after_cents", { mode: "number" }),
  },
  (table) => [uniqueIndex("ledger_entries_idempotency_key_idx").on(table.idempotencyKey)],
);
