import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, StatCard } from "@oneworld/ui";
import { getDb } from "@oneworld/db";
import { AirportService, DrizzleAirportRepository } from "@oneworld/domain-airports";
import { asAirportId } from "@oneworld/contracts";
import { loadEnv } from "@oneworld/config";
import { AirportMap } from "../../../components/AirportMap.js";

const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

function tierLabel(tier: string): string {
  return tier.replace(/_/g, " ");
}

export default async function AirportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const env = loadEnv();
  const airportService = new AirportService(new DrizzleAirportRepository(getDb()));

  const airport = await airportService.getById(asAirportId(id));
  if (!airport) notFound();

  const nearby = await airportService.listNearby(airport, 75, 8);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/airports" className="text-sm text-neutral-400 underline">
          &larr; Back to airport search
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          {airport.ident} - {airport.name}
        </h1>
        <p className="text-sm text-neutral-500">
          {airport.municipality ?? "Unknown city"}
          {airport.regionCode ? `, ${airport.regionCode}` : ""} - {airport.countryCode}
          {airport.icao ? ` - ICAO ${airport.icao}` : ""}
          {airport.localCode ? ` - Local ${airport.localCode}` : ""}
        </p>
        <div className="mt-2 flex gap-2">
          <Badge>{tierLabel(airport.physicalTier)}</Badge>
          <Badge tone="positive">{tierLabel(airport.activityClass)}</Badge>
        </div>
      </div>

      <AirportMap
        markers={[
          {
            id: airport.id,
            ident: airport.ident,
            name: airport.name,
            latitude: airport.latitude,
            longitude: airport.longitude,
          },
        ]}
        center={[airport.longitude, airport.latitude]}
        zoom={9}
        styleUrl={env.NEXT_PUBLIC_MAP_STYLE_URL ?? DEFAULT_MAP_STYLE_URL}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Activity score"
          value={String(airport.activityScore)}
          hint={tierLabel(airport.activityClass)}
        />
        <StatCard
          label="Elevation"
          value={airport.elevationFt !== undefined ? `${airport.elevationFt} ft` : "Unknown"}
        />
        <StatCard label="Waiting passengers" value="-" hint="Passenger pools land in Phase 4" />
        <StatCard label="Available aircraft" value="-" hint="Aircraft rentals land in Phase 5" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-medium text-neutral-300">Nearby airports</h2>
          {nearby.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">No other preview airports within 75 nm.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {nearby.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-2">
                  <Link href={`/airports/${n.id}`} className="text-neutral-100 underline">
                    {n.ident} - {n.name}
                  </Link>
                  <span className="text-neutral-500">{n.distanceNm.toFixed(0)} nm</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-neutral-300">Route / job builder</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Passenger jobs and the route builder land in Phase 4 once passenger pools and job
            creation are implemented.
          </p>
        </Card>
      </div>
    </div>
  );
}
