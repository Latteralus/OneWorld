import { describe, expect, it } from "vitest";
import { asAirportId, asCityId, asFinancialAccountId, DomainError } from "@oneworld/contracts";
import { cents } from "@oneworld/utils";
import { LedgerService, InMemoryLedgerRepository } from "@oneworld/domain-finance";
import { HousingService, InMemoryHousingRepository } from "@oneworld/domain-housing";
import { VehicleService, InMemoryVehicleRepository } from "@oneworld/domain-vehicles";
import {
  QualificationService,
  InMemoryQualificationRepository,
} from "@oneworld/domain-qualifications";
import { LocationService, InMemoryLocationRepository } from "@oneworld/domain-locations";
import { OnboardingService } from "../application/onboarding.service.js";
import { InMemoryPlayerRepository } from "../infrastructure/player.repository.memory.js";
import type { CompleteOnboardingInput } from "../domain/onboarding.types.js";

function makeService() {
  const playerRepo = new InMemoryPlayerRepository();
  const ledgerService = new LedgerService(new InMemoryLedgerRepository());
  const housingService = new HousingService(new InMemoryHousingRepository());
  const vehicleService = new VehicleService(new InMemoryVehicleRepository());
  const qualificationService = new QualificationService(new InMemoryQualificationRepository());
  const locationService = new LocationService(new InMemoryLocationRepository());

  const service = new OnboardingService({
    playerRepo,
    ledgerService,
    housingService,
    vehicleService,
    qualificationService,
    locationService,
  });

  return { service, playerRepo, ledgerService, locationService };
}

function makeInput(overrides: Partial<CompleteOnboardingInput> = {}): CompleteOnboardingInput {
  return {
    authUserId: "auth-user-1",
    username: "newpilot",
    displayName: "New Pilot",
    companyName: "New Pilot Aviation",
    homeCityId: asCityId("city-denver"),
    homeAirportId: asAirportId("KDEN"),
    ...overrides,
  };
}

describe("OnboardingService.completeOnboarding", () => {
  it("creates a profile and grants every starting asset exactly once", async () => {
    const { service, locationService } = makeService();

    const result = await service.completeOnboarding(makeInput());

    expect(result.alreadyOnboarded).toBe(false);
    expect(result.profile.username).toBe("newpilot");
    expect(result.personalAccountId).toBeDefined();
    expect(result.companyAccountId).toBeDefined();
    expect(result.residenceId).toBeDefined();
    expect(result.vehicleId).toBeDefined();
    expect(result.qualificationId).toBeDefined();

    const location = await locationService.getLocation(result.profile.id);
    expect(location).toEqual({
      playerId: result.profile.id,
      locationType: "CITY_RESIDENCE",
      cityId: asCityId("city-denver"),
    });
  });

  it("posts the configured starting balances to each account", async () => {
    const { service, ledgerService } = makeService();

    const result = await service.completeOnboarding(makeInput());

    const personalBalance = await ledgerService.getAccountBalance(
      asFinancialAccountId(result.personalAccountId!),
    );
    const companyBalance = await ledgerService.getAccountBalance(
      asFinancialAccountId(result.companyAccountId!),
    );

    expect(personalBalance).toBe(cents(250_000));
    expect(companyBalance).toBe(cents(500_000));
  });

  it("is idempotent: calling twice for the same auth user does not re-grant anything", async () => {
    const { service, playerRepo } = makeService();
    const input = makeInput();

    const first = await service.completeOnboarding(input);
    const second = await service.completeOnboarding(input);

    expect(second.alreadyOnboarded).toBe(true);
    expect(second.profile.id).toBe(first.profile.id);
    expect(second.personalAccountId).toBeUndefined();

    const profiles = await playerRepo.findById(first.profile.id);
    expect(profiles).toBeDefined();
  });

  it("rejects a username that is already taken by a different auth user", async () => {
    const { service } = makeService();
    await service.completeOnboarding(
      makeInput({ authUserId: "auth-user-1", username: "sameuser" }),
    );

    await expect(
      service.completeOnboarding(makeInput({ authUserId: "auth-user-2", username: "sameuser" })),
    ).rejects.toThrow(DomainError);
  });
});
