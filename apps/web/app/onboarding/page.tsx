import { redirect } from "next/navigation";
import { Badge, Card } from "@oneworld/ui";
import { getDb } from "@oneworld/db";
import { CityService, DrizzleCityRepository } from "@oneworld/domain-locations";
import { PlayerService, DrizzlePlayerRepository } from "@oneworld/domain-players";
import { asPlayerId } from "@oneworld/contracts";
import { economyConfig, housingConfig, onboardingConfig, qualificationConfig } from "@oneworld/config";
import { cents, formatUsd } from "@oneworld/utils";
import { requireAuthenticatedUserId } from "../../lib/auth.js";
import { completeOnboardingAction } from "./actions.js";
import { OnboardingForm, type OnboardingCityOption } from "./OnboardingForm.js";

const STARTING_RESIDENCE = housingConfig.residenceTypes.find(
  (type) => type.key === "run_down_apartment",
)!;
const STARTING_QUALIFICATION = qualificationConfig.definitions.find((def) => def.key === "PPL")!;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authUserId = await requireAuthenticatedUserId();
  const db = getDb();

  const existingProfile = await new PlayerService(new DrizzlePlayerRepository(db)).getProfile(
    asPlayerId(authUserId),
  );
  if (existingProfile) {
    redirect("/dashboard");
  }

  const cityService = new CityService(new DrizzleCityRepository(db));
  const cities = await cityService.listCities();
  const citiesWithAirports: OnboardingCityOption[] = await Promise.all(
    cities.map(async (city) => ({
      id: city.id,
      name: city.name,
      region: city.region,
      airports: (await cityService.listAirportsForCity(city.id)).map((airport) => ({
        id: airport.airportId,
        ident: airport.ident,
        name: airport.name,
        isPrimary: airport.isPrimary,
      })),
    })),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create your pilot</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Every career starts the same way - a license, a place to live, a car, and just enough
          cash to get flying. What happens next is up to you.
        </p>
      </div>

      {error ? (
        <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {citiesWithAirports.length === 0 ? (
        <p className="rounded border border-amber-900 bg-amber-950 px-3 py-2 text-sm text-amber-200">
          No starting cities are seeded yet. Run the airport import (
          <code>pnpm --filter @oneworld/data-import-airports import-airports</code>) and seed
          cities before onboarding can offer a home airport.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <OnboardingForm
            cities={citiesWithAirports}
            action={completeOnboardingAction}
            defaultCityId={citiesWithAirports[0]!.id}
          />

          <Card className="h-fit space-y-4 lg:sticky lg:top-6">
            <h2 className="text-sm font-medium text-neutral-200">Starting package</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-neutral-500">License</dt>
                <dd className="text-neutral-200">{STARTING_QUALIFICATION.name}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Residence</dt>
                <dd className="text-neutral-200">{STARTING_RESIDENCE.name}</dd>
                <dd className="text-xs text-neutral-500">
                  {formatUsd(cents(STARTING_RESIDENCE.weeklyRentCents))}/week - first week prepaid
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Vehicle</dt>
                <dd className="text-neutral-200">{onboardingConfig.startingVehicle.name}</dd>
                <dd className="text-xs text-neutral-500">
                  Owned outright -{" "}
                  {formatUsd(cents(onboardingConfig.startingVehicle.weeklyMaintenanceCents))}/week
                  maintenance
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Personal balance</dt>
                <dd className="text-neutral-200">
                  {formatUsd(cents(economyConfig.startingPersonalBalanceCents))}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Company balance</dt>
                <dd className="text-neutral-200">
                  {formatUsd(cents(economyConfig.startingCompanyBalanceCents))}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-1 pt-1">
              <Badge tone="warning">Very poor quality</Badge>
              <Badge>Low reliability</Badge>
            </div>
            <p className="text-xs text-neutral-600">
              You&apos;ll start humble - upgrading housing, vehicles, and qualifications is the
              game.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
