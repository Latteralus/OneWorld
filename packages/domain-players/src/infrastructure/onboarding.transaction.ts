import type { Database } from "@oneworld/db";
import { LedgerService, DrizzleLedgerRepository } from "@oneworld/domain-finance";
import { HousingService, DrizzleHousingRepository } from "@oneworld/domain-housing";
import { VehicleService, DrizzleVehicleRepository } from "@oneworld/domain-vehicles";
import {
  QualificationService,
  DrizzleQualificationRepository,
} from "@oneworld/domain-qualifications";
import { LocationService, DrizzleLocationRepository } from "@oneworld/domain-locations";
import { OnboardingService } from "../application/onboarding.service.js";
import { DrizzlePlayerRepository } from "./player.repository.drizzle.js";
import type { CompleteOnboardingInput, OnboardingResult } from "../domain/onboarding.types.js";

/**
 * Runs `OnboardingService.completeOnboarding` inside one Postgres
 * transaction: every domain's Drizzle repository is constructed against
 * the same `tx`, so a failure partway through (e.g. the vehicle grant)
 * rolls back the profile, accounts, and residence too - "starting assets
 * are granted exactly once" (roadmap Phase 1 exit criterion) means
 * all-or-nothing, not just non-duplicated.
 */
export async function runOnboardingTransaction(
  db: Database,
  input: CompleteOnboardingInput,
): Promise<OnboardingResult> {
  return db.transaction(async (tx) => {
    const service = new OnboardingService({
      playerRepo: new DrizzlePlayerRepository(tx),
      ledgerService: new LedgerService(new DrizzleLedgerRepository(tx)),
      housingService: new HousingService(new DrizzleHousingRepository(tx)),
      vehicleService: new VehicleService(new DrizzleVehicleRepository(tx)),
      qualificationService: new QualificationService(new DrizzleQualificationRepository(tx)),
      locationService: new LocationService(new DrizzleLocationRepository(tx)),
    });

    return service.completeOnboarding(input);
  });
}
