import { describe, expect, it } from "vitest";
import type { CityId, PlayerId } from "@oneworld/contracts";
import { EmploymentService } from "../application/employment.service.js";
import { InMemoryEmploymentRepository } from "../infrastructure/employment.repository.memory.js";

function makeService() {
  const repo = new InMemoryEmploymentRepository();
  return { repo, service: new EmploymentService(repo) };
}

const cityId = "city-1" as CityId;
const playerId = "player-1" as PlayerId;

async function seedOnePosting(service: EmploymentService) {
  const [posting] = await service.seedJobPostings([cityId]);
  if (!posting) throw new Error("expected a seeded posting");
  return posting;
}

describe("EmploymentService.seedJobPostings", () => {
  it("seeds one open posting per template per city", async () => {
    const { service } = makeService();
    const postings = await service.seedJobPostings([cityId]);
    expect(postings).toHaveLength(10); // employmentConfig.jobTemplates.length
    expect(postings.every((p) => p.status === "OPEN")).toBe(true);
  });

  it("is idempotent - re-seeding does not duplicate postings", async () => {
    const { service } = makeService();
    await service.seedJobPostings([cityId]);
    const second = await service.seedJobPostings([cityId]);
    const open = await service.listOpenPostings(cityId);
    expect(second).toHaveLength(10);
    expect(open).toHaveLength(10);
  });
});

describe("EmploymentService.submitApplication", () => {
  it("creates a pending application with a decision delay within the configured window", async () => {
    const { service } = makeService();
    const posting = await seedOnePosting(service);
    const now = new Date("2026-07-28T12:00:00Z");

    const application = await service.submitApplication({
      playerId,
      postingId: posting.id,
      now,
      randomUnit: 0.5,
    });

    expect(application.status).toBe("PENDING");
    expect(application.decisionAt).toBeDefined();
    expect(application.decisionAt!.getTime()).toBeGreaterThan(now.getTime());
  });

  it("rejects a second application while one is still pending", async () => {
    const { service } = makeService();
    const posting = await seedOnePosting(service);
    const now = new Date("2026-07-28T12:00:00Z");

    await service.submitApplication({ playerId, postingId: posting.id, now, randomUnit: 0.5 });

    await expect(
      service.submitApplication({ playerId, postingId: posting.id, now, randomUnit: 0.5 }),
    ).rejects.toMatchObject({ code: "APPLICATION_ALREADY_PENDING" });
  });

  it("rejects an application to an unknown posting", async () => {
    const { service } = makeService();
    await expect(
      service.submitApplication({
        playerId,
        postingId: "does-not-exist" as never,
        now: new Date(),
        randomUnit: 0.5,
      }),
    ).rejects.toMatchObject({ code: "JOB_POSTING_UNAVAILABLE" });
  });
});

describe("EmploymentService.resolveDueDecisions", () => {
  it("resolves applications whose decision delay has elapsed and leaves others pending", async () => {
    const { service } = makeService();
    const posting = await seedOnePosting(service); // dishwasher, very_high availability
    const submittedAt = new Date("2026-07-28T00:00:00Z");
    const application = await service.submitApplication({
      playerId,
      postingId: posting.id,
      now: submittedAt,
      randomUnit: 0, // shortest delay: 2 hours
    });

    const beforeDecision = new Date(application.decisionAt!.getTime() - 1_000);
    const stillPending = await service.resolveDueDecisions(beforeDecision, () => 0.5);
    expect(stillPending).toHaveLength(0);

    // very_high acceptance threshold is 0.97 - 0.5 is comfortably an accept.
    const resolved = await service.resolveDueDecisions(application.decisionAt!, () => 0.5);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.accepted).toBe(true);
    expect(resolved[0]!.application.status).toBe("ACCEPTED");
  });

  it("rejects when the drawn random value exceeds the availability's acceptance rate", async () => {
    const { service } = makeService();
    const posting = await seedOnePosting(service); // dishwasher, very_high (0.97)
    const application = await service.submitApplication({
      playerId,
      postingId: posting.id,
      now: new Date("2026-07-28T00:00:00Z"),
      randomUnit: 0,
    });

    const resolved = await service.resolveDueDecisions(application.decisionAt!, () => 0.99);
    expect(resolved[0]!.accepted).toBe(false);
    expect(resolved[0]!.application.status).toBe("REJECTED");
  });
});

describe("EmploymentService.acceptOffer / declineOffer", () => {
  async function makeAcceptedApplication(service: EmploymentService) {
    const posting = await seedOnePosting(service);
    const application = await service.submitApplication({
      playerId,
      postingId: posting.id,
      now: new Date("2026-07-28T00:00:00Z"),
      randomUnit: 0,
    });
    await service.resolveDueDecisions(application.decisionAt!, () => 0.5); // accepts (very_high)
    return { posting, applicationId: application.id };
  }

  it("creates active employment on accept, scheduling the next DST-aware payroll", async () => {
    const { service } = makeService();
    const { posting, applicationId } = await makeAcceptedApplication(service);

    const employment = await service.acceptOffer({
      playerId,
      applicationId,
      now: new Date("2026-07-28T12:00:00Z"),
    });

    expect(employment.status).toBe("ACTIVE");
    expect(employment.title).toBe(posting.title);
    expect(employment.dailyWageCents).toBe(posting.dailyWageCents);
    expect(employment.nextPayAt.toISOString()).toBe("2026-07-28T13:00:00.000Z"); // 9am EDT same day (12:00 UTC is 08:00 EDT, before payroll hour)

    const active = await service.getActiveEmployment(playerId);
    expect(active?.id).toBe(employment.id);
  });

  it("replaces an existing active job rather than blocking (one-job rule, spec section 8.2)", async () => {
    const { service } = makeService();
    const { applicationId: firstApplicationId } = await makeAcceptedApplication(service);
    const first = await service.acceptOffer({
      playerId,
      applicationId: firstApplicationId,
      now: new Date("2026-07-28T12:00:00Z"),
    });

    // A second posting/application/accept cycle for the same player, one
    // day later so the second application isn't blocked by the
    // one-pending-application guard (the first is no longer pending).
    const [, secondPosting] = await service.listOpenPostings(cityId);
    const secondApplication = await service.submitApplication({
      playerId,
      postingId: secondPosting!.id,
      now: new Date("2026-07-29T00:00:00Z"),
      randomUnit: 0,
    });
    await service.resolveDueDecisions(secondApplication.decisionAt!, () => 0.5);
    const second = await service.acceptOffer({
      playerId,
      applicationId: secondApplication.id,
      now: new Date("2026-07-29T12:00:00Z"),
    });

    expect(second.status).toBe("ACTIVE");
    const active = await service.getActiveEmployment(playerId);
    expect(active?.id).toBe(second.id);
    expect(active?.id).not.toBe(first.id);
  });

  it("declines an offer without creating employment", async () => {
    const { service } = makeService();
    const { applicationId } = await makeAcceptedApplication(service);

    await service.declineOffer({ playerId, applicationId });

    await expect(service.getActiveEmployment(playerId)).resolves.toBeUndefined();
    await expect(
      service.acceptOffer({ playerId, applicationId, now: new Date() }),
    ).rejects.toMatchObject({ code: "APPLICATION_NOT_ACCEPTED" });
  });
});

describe("EmploymentService.runPayrollSweep", () => {
  it("pays employments whose nextPayAt has passed and advances the schedule without drifting", async () => {
    const { service } = makeService();
    const posting = await seedOnePosting(service);
    const application = await service.submitApplication({
      playerId,
      postingId: posting.id,
      now: new Date("2026-07-28T00:00:00Z"),
      randomUnit: 0,
    });
    await service.resolveDueDecisions(application.decisionAt!, () => 0.5);
    const employment = await service.acceptOffer({
      playerId,
      applicationId: application.id,
      now: new Date("2026-07-28T12:00:00Z"),
    });

    const due = await service.runPayrollSweep(employment.nextPayAt);
    expect(due).toHaveLength(1);
    expect(due[0]!.employment.id).toBe(employment.id);
    expect(due[0]!.payDateKey).toBe("2026-07-28");

    const updated = await service.getActiveEmployment(playerId);
    expect(updated!.nextPayAt.getTime()).toBeGreaterThan(employment.nextPayAt.getTime());

    // Running again immediately must not find it due a second time (idempotent scheduling).
    const secondSweep = await service.runPayrollSweep(employment.nextPayAt);
    expect(secondSweep).toHaveLength(0);
  });
});
