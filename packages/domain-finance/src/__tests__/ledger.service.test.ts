import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import type { FinancialAccountId } from "@oneworld/contracts";
import { LedgerService } from "../application/ledger.service.js";
import { InMemoryLedgerRepository } from "../infrastructure/ledger.repository.memory.js";
import { buildIdempotencyKey } from "../domain/ledger.rules.js";

function makeService() {
  const repo = new InMemoryLedgerRepository();
  const accountId = "acct-1" as FinancialAccountId;
  repo.seedAccount({
    id: accountId,
    ownerType: "player",
    ownerId: "player-1",
    accountType: "personal",
    currency: "USD",
    cachedBalanceCents: cents(250_000),
  });
  return { repo, service: new LedgerService(repo), accountId };
}

describe("LedgerService.postEntry", () => {
  it("posts a debit and updates the account balance", async () => {
    const { service, repo, accountId } = makeService();

    const entry = await service.postEntry({
      accountId,
      amountCents: cents(-80_000),
      category: "weekly_rent",
      description: "Weekly rent - Run-Down Apartment",
      idempotencyKey: buildIdempotencyKey.housingRent("tenancy-1", "2026-31"),
    });

    expect(entry.balanceAfterCents).toBe(170_000);
    const account = await repo.getAccount(accountId);
    expect(account.cachedBalanceCents).toBe(170_000);
  });

  it("is idempotent: replaying the same key does not duplicate money (spec section 7.3)", async () => {
    const { service, repo, accountId } = makeService();
    const idempotencyKey = buildIdempotencyKey.employmentPay("employment-1", "2026-07-28");

    const first = await service.postEntry({
      accountId,
      amountCents: cents(12_000),
      category: "civilian_wage",
      description: "Daily wage",
      idempotencyKey,
    });

    // Simulate the worker running twice (e.g. retried after a timeout).
    const second = await service.postEntry({
      accountId,
      amountCents: cents(12_000),
      category: "civilian_wage",
      description: "Daily wage",
      idempotencyKey,
    });

    expect(second.id).toBe(first.id);
    expect(second.balanceAfterCents).toBe(first.balanceAfterCents);

    const account = await repo.getAccount(accountId);
    expect(account.cachedBalanceCents).toBe(262_000); // +12,000 exactly once
    expect(repo.entriesFor(accountId)).toHaveLength(1);
  });

  it("rejects zero-amount entries", async () => {
    const { service, accountId } = makeService();
    await expect(
      service.postEntry({
        accountId,
        amountCents: cents(0),
        category: "civilian_wage",
        description: "Invalid",
        idempotencyKey: "test:zero",
      }),
    ).rejects.toThrow(RangeError);
  });
});

describe("LedgerService.openAccount", () => {
  it("opens a new zero-balance account", async () => {
    const repo = new InMemoryLedgerRepository();
    const service = new LedgerService(repo);

    const account = await service.openAccount({
      ownerType: "player",
      ownerId: "player-2",
      accountType: "personal",
    });

    expect(account.cachedBalanceCents).toBe(0);
    expect(account.ownerId).toBe("player-2");
  });

  it("is idempotent: returns the existing account instead of opening a duplicate", async () => {
    const repo = new InMemoryLedgerRepository();
    const service = new LedgerService(repo);

    const first = await service.openAccount({
      ownerType: "player",
      ownerId: "player-3",
      accountType: "company",
    });
    const second = await service.openAccount({
      ownerType: "player",
      ownerId: "player-3",
      accountType: "company",
    });

    expect(second.id).toBe(first.id);
  });
});

describe("LedgerService.listRecentEntries", () => {
  it("returns entries newest-first, capped at the limit", async () => {
    const { service, accountId } = makeService();
    await service.postEntry({
      accountId,
      amountCents: cents(1_000),
      category: "civilian_wage",
      description: "First",
      idempotencyKey: "test:entry-1",
    });
    await service.postEntry({
      accountId,
      amountCents: cents(2_000),
      category: "civilian_wage",
      description: "Second",
      idempotencyKey: "test:entry-2",
    });

    const recent = await service.listRecentEntries(accountId, 1);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.description).toBe("Second");
  });
});
