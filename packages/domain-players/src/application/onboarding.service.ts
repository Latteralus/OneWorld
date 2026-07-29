import { asPlayerId, DomainError } from "@oneworld/contracts";
import {
  economyConfig,
  housingConfig,
  onboardingConfig,
  qualificationConfig,
} from "@oneworld/config";
import { addDays, cents, nowUtc } from "@oneworld/utils";
import type { LedgerService } from "@oneworld/domain-finance";
import { buildIdempotencyKey } from "@oneworld/domain-finance";
import type { HousingService } from "@oneworld/domain-housing";
import type { VehicleService } from "@oneworld/domain-vehicles";
import type { QualificationService } from "@oneworld/domain-qualifications";
import type { LocationService } from "@oneworld/domain-locations";
import type { PlayerRepository } from "../domain/player.types.js";
import type { CompleteOnboardingInput, OnboardingResult } from "../domain/onboarding.types.js";

const STARTING_RESIDENCE = housingConfig.residenceTypes.find(
  (type) => type.key === "run_down_apartment",
);
const STARTING_QUALIFICATION = qualificationConfig.definitions.find((def) => def.key === "PPL");

export interface OnboardingServiceDependencies {
  playerRepo: PlayerRepository;
  ledgerService: LedgerService;
  housingService: HousingService;
  vehicleService: VehicleService;
  qualificationService: QualificationService;
  locationService: LocationService;
}

/**
 * Orchestrates player creation and the one-time starting-asset grant
 * (spec section 6, roadmap Phase 1). This is the one place in the codebase
 * that composes several domains' public services in a single call - see
 * this package's README for why that's this domain's job (it owns
 * `PlayerCreated`/`StartingAssetsGranted`, spec section 24.3).
 *
 * Callers are responsible for running `completeOnboarding` inside a single
 * database transaction (see `infrastructure/onboarding.transaction.ts`) so
 * a failure partway through grants nothing rather than granting some
 * assets and not others.
 */
export class OnboardingService {
  constructor(private readonly deps: OnboardingServiceDependencies) {}

  async completeOnboarding(input: CompleteOnboardingInput): Promise<OnboardingResult> {
    if (!STARTING_RESIDENCE)
      throw new Error('Missing "run_down_apartment" in housingConfig.residenceTypes');
    if (!STARTING_QUALIFICATION)
      throw new Error('Missing "PPL" in qualificationConfig.definitions');

    const playerId = asPlayerId(input.authUserId);

    const existing = await this.deps.playerRepo.findById(playerId);
    if (existing) {
      return {
        profile: existing,
        alreadyOnboarded: true,
        personalAccountId: undefined,
        companyAccountId: undefined,
        residenceId: undefined,
        vehicleId: undefined,
        qualificationId: undefined,
      };
    }

    const usernameTaken = await this.deps.playerRepo.findByUsername(input.username);
    if (usernameTaken) {
      throw new DomainError("USERNAME_TAKEN", `Username "${input.username}" is already taken`);
    }

    const profile = await this.deps.playerRepo.insertProfile(input);

    const personalAccount = await this.deps.ledgerService.openAccount({
      ownerType: "player",
      ownerId: playerId,
      accountType: "personal",
    });
    const companyAccount = await this.deps.ledgerService.openAccount({
      ownerType: "player",
      ownerId: playerId,
      accountType: "company",
    });

    await this.deps.ledgerService.postEntry({
      accountId: personalAccount.id,
      amountCents: cents(economyConfig.startingPersonalBalanceCents),
      category: "starting_funds",
      description: "Starting personal balance",
      relatedType: "player",
      relatedId: playerId,
      idempotencyKey: buildIdempotencyKey.startingFunds(playerId, "personal"),
    });
    await this.deps.ledgerService.postEntry({
      accountId: companyAccount.id,
      amountCents: cents(economyConfig.startingCompanyBalanceCents),
      category: "starting_funds",
      description: "Starting company balance",
      relatedType: "player",
      relatedId: playerId,
      idempotencyKey: buildIdempotencyKey.startingFunds(playerId, "company"),
    });

    const now = nowUtc();
    const residence = await this.deps.housingService.grantStartingResidence({
      playerId,
      cityId: input.homeCityId,
      residenceTypeKey: STARTING_RESIDENCE.key,
      residenceTypeName: STARTING_RESIDENCE.name,
      weeklyRentCents: cents(STARTING_RESIDENCE.weeklyRentCents),
      quality: STARTING_RESIDENCE.quality,
      parkingCapacity: STARTING_RESIDENCE.parkingCapacity,
      statusScore: STARTING_RESIDENCE.statusScore,
      // First week's rent is pre-paid at signup (spec section 6.6) - the first charge is due a week out.
      nextRentDueAt: economyConfig.firstWeekRentPrepaid ? addDays(now, 7) : now,
    });

    const vehicle = await this.deps.vehicleService.grantStartingVehicle({
      playerId,
      currentCityId: input.homeCityId,
      typeKey: "starting_hunda_attord",
      name: onboardingConfig.startingVehicle.name,
      valueCents: cents(onboardingConfig.startingVehicle.startingValueCents),
      speedMph: onboardingConfig.startingVehicle.effectiveTravelSpeedMph,
      fuelEfficiencyMpg: onboardingConfig.startingVehicle.fuelEfficiencyMpg,
      tankCapacityGallons: onboardingConfig.startingVehicle.tankCapacityGallons,
      expectedLifespanMiles: onboardingConfig.startingVehicle.expectedLifespanMiles,
      weeklyMaintenanceCents: cents(onboardingConfig.startingVehicle.weeklyMaintenanceCents),
      quality: onboardingConfig.startingVehicle.quality,
      reliability: onboardingConfig.startingVehicle.reliability,
      statusScore: onboardingConfig.startingVehicle.statusScore,
      mileageMin: onboardingConfig.startingVehicle.startingMileageMin,
      mileageMax: onboardingConfig.startingVehicle.startingMileageMax,
      // Mirrors the first-week rent protection (spec section 6.6): the
      // first maintenance charge isn't due immediately after account creation.
      nextMaintenanceDueAt: addDays(now, 7),
    });

    const { qualification } = await this.deps.qualificationService.grantStartingQualification({
      playerId,
      qualificationKey: STARTING_QUALIFICATION.key,
      qualificationName: STARTING_QUALIFICATION.name,
      type: "license",
      tuitionCents: cents(STARTING_QUALIFICATION.tuitionCents),
      durationHours: STARTING_QUALIFICATION.durationHours,
      requiresCheckFlight: STARTING_QUALIFICATION.requiresCheckFlight,
    });

    await this.deps.locationService.setLocation({
      playerId,
      locationType: "CITY_RESIDENCE",
      cityId: input.homeCityId,
    });

    return {
      profile,
      alreadyOnboarded: false,
      personalAccountId: personalAccount.id,
      companyAccountId: companyAccount.id,
      residenceId: residence.id,
      vehicleId: vehicle.id,
      qualificationId: qualification.qualificationId,
    };
  }
}
