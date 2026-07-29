import { addCents, cents } from "@oneworld/utils";
import type { FinancialAccountId, LedgerEntryId } from "@oneworld/contracts";
import type {
  FinancialAccount,
  LedgerEntry,
  LedgerEntryInput,
  LedgerRepository,
  OpenAccountInput,
} from "../domain/ledger.types.js";

let sequence = 0;
function nextId(): string {
  sequence += 1;
  return `mem-ledger-${sequence}`;
}

/**
 * In-memory `LedgerRepository` for unit tests and local prototyping
 * (spec section 20.4: application services depend on the repository
 * interface, not a specific infrastructure). The Postgres-backed
 * implementation lives in `ledger.repository.drizzle.ts` and must uphold
 * the exact same idempotency contract.
 */
export class InMemoryLedgerRepository implements LedgerRepository {
  private readonly accounts = new Map<string, FinancialAccount>();
  private readonly entriesByIdempotencyKey = new Map<string, LedgerEntry>();
  private readonly entriesByAccount = new Map<string, LedgerEntry[]>();

  seedAccount(account: FinancialAccount): void {
    this.accounts.set(account.id, account);
  }

  async getAccount(accountId: FinancialAccountId): Promise<FinancialAccount> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error(`Unknown financial account: ${accountId}`);
    return account;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<LedgerEntry | undefined> {
    return this.entriesByIdempotencyKey.get(idempotencyKey);
  }

  async findAccount(
    ownerId: string,
    accountType: FinancialAccount["accountType"],
  ): Promise<FinancialAccount | undefined> {
    return [...this.accounts.values()].find(
      (account) => account.ownerId === ownerId && account.accountType === accountType,
    );
  }

  async openAccount(input: OpenAccountInput): Promise<FinancialAccount> {
    const account: FinancialAccount = {
      id: nextId() as FinancialAccountId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      accountType: input.accountType,
      currency: "USD",
      cachedBalanceCents: cents(0),
    };
    this.accounts.set(account.id, account);
    return account;
  }

  async postEntryIfNew(input: LedgerEntryInput): Promise<{ entry: LedgerEntry; wasNew: boolean }> {
    const existing = this.entriesByIdempotencyKey.get(input.idempotencyKey);
    if (existing) {
      return { entry: existing, wasNew: false };
    }

    const account = await this.getAccount(input.accountId);
    const balanceAfterCents = addCents(account.cachedBalanceCents, input.amountCents);

    const entry: LedgerEntry = {
      id: nextId() as LedgerEntryId,
      accountId: input.accountId,
      amountCents: input.amountCents,
      category: input.category,
      description: input.description,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      idempotencyKey: input.idempotencyKey,
      effectiveAt: input.effectiveAt ?? new Date(),
      createdAt: new Date(),
      balanceAfterCents,
    };

    this.accounts.set(account.id, { ...account, cachedBalanceCents: balanceAfterCents });
    this.entriesByIdempotencyKey.set(input.idempotencyKey, entry);
    this.entriesByAccount.set(account.id, [
      ...(this.entriesByAccount.get(account.id) ?? []),
      entry,
    ]);

    return { entry, wasNew: true };
  }

  entriesFor(accountId: FinancialAccountId): LedgerEntry[] {
    return this.entriesByAccount.get(accountId) ?? [];
  }

  async listRecentEntries(accountId: FinancialAccountId, limit: number): Promise<LedgerEntry[]> {
    const entries = this.entriesByAccount.get(accountId) ?? [];
    return [...entries].reverse().slice(0, limit);
  }
}
