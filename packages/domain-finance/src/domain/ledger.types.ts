import type { Cents } from "@oneworld/utils";
import type { FinancialAccountId, LedgerEntryId } from "@oneworld/contracts";

/** Ledger categories from spec section 7.2. */
export const ledgerCategories = [
  "starting_funds",
  "passenger_flight_revenue",
  "aircraft_rental",
  "aviation_fuel",
  "airport_fees",
  "bus_fare",
  "ground_vehicle_fuel",
  "weekly_rent",
  "vehicle_maintenance",
  "civilian_wage",
  "training_tuition",
  "owner_transfer",
] as const;
export type LedgerCategory = (typeof ledgerCategories)[number];

export type AccountType = "personal" | "company";
export type OwnerType = "player" | "company" | "system";

export interface FinancialAccount {
  id: FinancialAccountId;
  ownerType: OwnerType;
  ownerId: string;
  accountType: AccountType;
  currency: "USD";
  cachedBalanceCents: Cents;
}

/** Everything the caller supplies to post one ledger entry (spec section 7.2). */
export interface LedgerEntryInput {
  accountId: FinancialAccountId;
  amountCents: Cents; // signed
  category: LedgerCategory;
  description: string;
  relatedType?: string;
  relatedId?: string;
  /** Deterministic key per spec section 7.3, e.g. `flight:{flightId}:settlement`. */
  idempotencyKey: string;
  effectiveAt?: Date;
}

export interface LedgerEntry {
  id: LedgerEntryId;
  accountId: FinancialAccountId;
  amountCents: Cents;
  category: LedgerCategory;
  description: string;
  relatedType?: string;
  relatedId?: string;
  idempotencyKey: string;
  effectiveAt: Date;
  createdAt: Date;
  balanceAfterCents: Cents;
}

/**
 * Repository interface owned by this domain (spec section 20.4: repository
 * interfaces sit above infrastructure). `postEntryIfNew` must be atomic and
 * must return the *existing* entry on a duplicate idempotency key rather
 * than throwing, so callers can treat posting as idempotent (section 7.3).
 */
export interface LedgerRepository {
  getAccount(accountId: FinancialAccountId): Promise<FinancialAccount>;
  findByIdempotencyKey(idempotencyKey: string): Promise<LedgerEntry | undefined>;
  postEntryIfNew(input: LedgerEntryInput): Promise<{ entry: LedgerEntry; wasNew: boolean }>;
}
