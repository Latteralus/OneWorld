import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge, Card, StatCard } from "@oneworld/ui";
import { getDb } from "@oneworld/db";
import { asPlayerId } from "@oneworld/contracts";
import { cents, formatUsd } from "@oneworld/utils";
import { onboardingConfig } from "@oneworld/config";
import { PlayerService, DrizzlePlayerRepository } from "@oneworld/domain-players";
import { LedgerService, DrizzleLedgerRepository } from "@oneworld/domain-finance";
import {
  CityService,
  DrizzleCityRepository,
  LocationService,
  DrizzleLocationRepository,
} from "@oneworld/domain-locations";
import { AirportService, DrizzleAirportRepository } from "@oneworld/domain-airports";
import { HousingService, DrizzleHousingRepository } from "@oneworld/domain-housing";
import { VehicleService, DrizzleVehicleRepository } from "@oneworld/domain-vehicles";
import {
  QualificationService,
  DrizzleQualificationRepository,
} from "@oneworld/domain-qualifications";
import { requireAuthenticatedUserId } from "../../lib/auth.js";

async function describeLocation(
  location: Awaited<ReturnType<LocationService["getLocation"]>>,
  cityService: CityService,
  airportService: AirportService,
): Promise<string> {
  if (!location) return "Unknown";
  switch (location.locationType) {
    case "CITY_RESIDENCE": {
      const city = await cityService.getCity(location.cityId);
      return city ? `Home - ${city.name}, ${city.region}` : "Home city";
    }
    case "AIRPORT": {
      const airport = await airportService.getById(location.airportId);
      return airport ? `${airport.ident} - ${airport.name}` : "At an airport";
    }
    case "IN_GROUND_TRANSIT":
      return "In transit";
    case "IN_SIMULATOR_FLIGHT":
      return "In flight";
    default:
      return "Unknown";
  }
}

export default async function DashboardPage() {
  const authUserId = await requireAuthenticatedUserId();
  const db = getDb();
  const playerId = asPlayerId(authUserId);

  const profile = await new PlayerService(new DrizzlePlayerRepository(db)).getProfile(playerId);
  if (!profile) {
    redirect("/onboarding");
  }

  const ledgerService = new LedgerService(new DrizzleLedgerRepository(db));
  const locationService = new LocationService(new DrizzleLocationRepository(db));
  const cityService = new CityService(new DrizzleCityRepository(db));
  const airportService = new AirportService(new DrizzleAirportRepository(db));
  const housingService = new HousingService(new DrizzleHousingRepository(db));
  const vehicleService = new VehicleService(new DrizzleVehicleRepository(db));
  const qualificationService = new QualificationService(new DrizzleQualificationRepository(db));

  const [personalAccount, companyAccount, location, residence, vehicle, ppl] = await Promise.all([
    ledgerService.openAccount({ ownerType: "player", ownerId: playerId, accountType: "personal" }),
    ledgerService.openAccount({ ownerType: "player", ownerId: playerId, accountType: "company" }),
    locationService.getLocation(playerId),
    housingService.getActiveResidence(playerId),
    vehicleService.getVehicleForPlayer(playerId),
    qualificationService.findQualification(playerId, "PPL"),
  ]);

  const [locationLabel, recentPersonalEntries] = await Promise.all([
    describeLocation(location, cityService, airportService),
    ledgerService.listRecentEntries(personalAccount.id, 5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile.displayName}</h1>
        <p className="text-sm text-neutral-500">{profile.companyName}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current location" value={locationLabel} />
        <StatCard label="Personal balance" value={formatUsd(personalAccount.cachedBalanceCents)} />
        <StatCard label="Company balance" value={formatUsd(companyAccount.cachedBalanceCents)} />
        <StatCard
          label="Qualifications"
          value={ppl ? "PPL" : "None"}
          hint={ppl ? `Awarded ${ppl.awardedAt.toLocaleDateString()}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Residence"
          value={residence ? residence.residenceTypeKey.replace(/_/g, " ") : "None"}
          hint={
            residence ? `Next rent due ${residence.nextRentDueAt.toLocaleDateString()}` : undefined
          }
        />
        <StatCard
          label="Vehicle"
          value={vehicle ? onboardingConfig.startingVehicle.name : "None"}
          hint={
            vehicle
              ? `${Math.round(vehicle.mileage).toLocaleString()} mi - ${formatUsd(cents(onboardingConfig.startingVehicle.weeklyMaintenanceCents))}/week maintenance`
              : undefined
          }
        />
        <StatCard label="Pilot hours" value="0.0 hrs" hint="No flights logged yet" />
        <StatCard
          label="Employment"
          value="Not employed"
          hint={
            onboardingConfig.protections.directPlayerToApplyForCivilianJob
              ? "Apply for a civilian job"
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-medium text-neutral-300">Next recommended goal</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Head to{" "}
            <Link href="/airports" className="text-neutral-100 underline">
              Map / Airports
            </Link>{" "}
            to see waiting passengers near you, or apply for a civilian job to start building steady
            income while you fly.
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-neutral-300">Recent transactions</h2>
          {recentPersonalEntries.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">No transactions yet.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {recentPersonalEntries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-2">
                  <span className="text-neutral-400">{entry.description}</span>
                  <Badge tone={entry.amountCents >= 0 ? "positive" : "neutral"}>
                    {entry.amountCents >= 0 ? "+" : ""}
                    {formatUsd(entry.amountCents)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
