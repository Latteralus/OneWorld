import type { LedgerEntry, LedgerEntryInput, LedgerRepository } from "../domain/ledger.types.js";
import { assertNonZeroAmount } from "../domain/ledger.rules.js";

/**
 * The Finance domain's public write path for money (spec section 24.2:
 * "Finance Service - Post ledger transaction"). Every other domain must
 * post through here rather than writing `ledger_entries` directly
 * (section 20.1 service boundary rule).
 */
export class LedgerService {
  constructor(private readonly repo: LedgerRepository) {}

  /**
   * Posts one ledger entry idempotently: if `idempotencyKey` was already
   * used, the existing entry is returned unchanged and no new row/balance
   * change occurs (spec section 7.3 - "repeated worker execution must not
   * duplicate money").
   */
  async postEntry(input: LedgerEntryInput): Promise<LedgerEntry> {
    assertNonZeroAmount(input.amountCents);

    const existing = await this.repo.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return existing;
    }

    const { entry } = await this.repo.postEntryIfNew(input);
    return entry;
  }

  async getAccountBalance(accountId: LedgerEntryInput["accountId"]) {
    const account = await this.repo.getAccount(accountId);
    return account.cachedBalanceCents;
  }
}
