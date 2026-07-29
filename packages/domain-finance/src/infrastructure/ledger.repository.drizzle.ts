import { and, desc, eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import { cents } from "@oneworld/utils";
import type { FinancialAccountId, LedgerEntryId } from "@oneworld/contracts";
import type {
  FinancialAccount,
  LedgerEntry,
  LedgerEntryInput,
  LedgerRepository,
  OpenAccountInput,
} from "../domain/ledger.types.js";
import { computeBalanceAfter } from "../domain/ledger.rules.js";

function toDomainAccount(row: typeof schema.financialAccounts.$inferSelect): FinancialAccount {
  return {
    id: row.id as FinancialAccountId,
    ownerType: row.ownerType as FinancialAccount["ownerType"],
    ownerId: row.ownerId,
    accountType: row.accountType as FinancialAccount["accountType"],
    currency: "USD",
    cachedBalanceCents: cents(row.cachedBalanceCents),
  };
}

function toDomainEntry(row: typeof schema.ledgerEntries.$inferSelect): LedgerEntry {
  return {
    id: row.id as LedgerEntryId,
    accountId: row.accountId as FinancialAccountId,
    amountCents: cents(row.amountCents),
    category: row.category as LedgerEntry["category"],
    description: row.description,
    relatedType: row.relatedType ?? undefined,
    relatedId: row.relatedId ?? undefined,
    idempotencyKey: row.idempotencyKey,
    effectiveAt: row.effectiveAt,
    createdAt: row.createdAt,
    balanceAfterCents: cents(Number(row.balanceAfterCents ?? 0)),
  };
}

/**
 * Postgres-backed `LedgerRepository`. Runs the read-check-write inside a
 * single transaction with a row lock on the account so concurrent posts
 * for the same account serialize (spec section 27.4: "pessimistic locks
 * for scarce pool reservations" applies equally to account balances).
 */
export class DrizzleLedgerRepository implements LedgerRepository {
  constructor(private readonly db: DbOrTx) {}

  async getAccount(accountId: FinancialAccountId): Promise<FinancialAccount> {
    const [row] = await this.db
      .select()
      .from(schema.financialAccounts)
      .where(eq(schema.financialAccounts.id, accountId));
    if (!row) throw new Error(`Unknown financial account: ${accountId}`);
    return toDomainAccount(row);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<LedgerEntry | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.ledgerEntries)
      .where(eq(schema.ledgerEntries.idempotencyKey, idempotencyKey));
    return row ? toDomainEntry(row) : undefined;
  }

  async findAccount(
    ownerId: string,
    accountType: FinancialAccount["accountType"],
  ): Promise<FinancialAccount | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.financialAccounts)
      .where(
        and(
          eq(schema.financialAccounts.ownerId, ownerId),
          eq(schema.financialAccounts.accountType, accountType),
        ),
      );
    return row ? toDomainAccount(row) : undefined;
  }

  async listRecentEntries(accountId: FinancialAccountId, limit: number): Promise<LedgerEntry[]> {
    const rows = await this.db
      .select()
      .from(schema.ledgerEntries)
      .where(eq(schema.ledgerEntries.accountId, accountId))
      .orderBy(desc(schema.ledgerEntries.createdAt))
      .limit(limit);
    return rows.map(toDomainEntry);
  }

  async openAccount(input: OpenAccountInput): Promise<FinancialAccount> {
    const [row] = await this.db
      .insert(schema.financialAccounts)
      .values({
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        accountType: input.accountType,
        currency: "USD",
        cachedBalanceCents: 0,
      })
      .returning();
    if (!row) throw new Error("Failed to open financial account");
    return toDomainAccount(row);
  }

  async postEntryIfNew(input: LedgerEntryInput): Promise<{ entry: LedgerEntry; wasNew: boolean }> {
    return this.db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(schema.ledgerEntries)
        .where(eq(schema.ledgerEntries.idempotencyKey, input.idempotencyKey));
      if (existing[0]) {
        return { entry: toDomainEntry(existing[0]), wasNew: false };
      }

      const [accountRow] = await tx
        .select()
        .from(schema.financialAccounts)
        .where(eq(schema.financialAccounts.id, input.accountId))
        .for("update");
      if (!accountRow) throw new Error(`Unknown financial account: ${input.accountId}`);

      const balanceAfterCents = computeBalanceAfter(
        cents(accountRow.cachedBalanceCents),
        input.amountCents,
      );

      const [insertedRow] = await tx
        .insert(schema.ledgerEntries)
        .values({
          accountId: input.accountId,
          amountCents: input.amountCents,
          category: input.category,
          description: input.description,
          relatedType: input.relatedType,
          relatedId: input.relatedId,
          idempotencyKey: input.idempotencyKey,
          effectiveAt: input.effectiveAt ?? new Date(),
          balanceAfterCents,
        })
        .returning();

      await tx
        .update(schema.financialAccounts)
        .set({ cachedBalanceCents: balanceAfterCents })
        .where(eq(schema.financialAccounts.id, input.accountId));

      if (!insertedRow) throw new Error("Failed to insert ledger entry");
      return { entry: toDomainEntry(insertedRow), wasNew: true };
    });
  }
}
