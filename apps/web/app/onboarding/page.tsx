import { redirect } from "next/navigation";
import { getDb } from "@oneworld/db";
import { CityService, DrizzleCityRepository } from "@oneworld/domain-locations";
import { PlayerService, DrizzlePlayerRepository } from "@oneworld/domain-players";
import { asPlayerId } from "@oneworld/contracts";
import { requireAuthenticatedUserId } from "../../lib/auth.js";
import { completeOnboardingAction } from "./actions.js";
import { OnboardingForm, type OnboardingCityOption } from "./OnboardingForm.js";

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
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome to OneWorld</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create your pilot. You&apos;ll start with a Private Pilot License, a run-down apartment,
          an old car, and enough cash to get flying (spec section 6).
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
          <code>pnpm --filter @oneworld/data-import-airports import</code>) and seed cities before
          onboarding can offer a home airport.
        </p>
      ) : (
        <OnboardingForm
          cities={citiesWithAirports}
          action={completeOnboardingAction}
          defaultCityId={citiesWithAirports[0]!.id}
        />
      )}
    </div>
  );
}
