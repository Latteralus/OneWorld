import Link from "next/link";
import { Badge, Card } from "@oneworld/ui";
import { getDb } from "@oneworld/db";
import { AirportService, DrizzleAirportRepository } from "@oneworld/domain-airports";
import { airportConfig, loadEnv, type AirportPhysicalTier } from "@oneworld/config";
import { AirportMap } from "../../components/AirportMap.js";

const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

function tierLabel(tier: string): string {
  return tier.replace(/_/g, " ");
}

export default async function AirportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: string }>;
}) {
  const { q, tier } = await searchParams;
  const env = loadEnv();

  const airportService = new AirportService(new DrizzleAirportRepository(getDb()));
  const results = await airportService.search({
    query: q || undefined,
    physicalTier: (tier as AirportPhysicalTier) || undefined,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Map / Airports</h1>
        <p className="text-sm text-neutral-500">
          Search the preview airport catalog by code, name, or city (spec section 26.4).
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="q" className="text-sm text-neutral-400">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="KDEN, Denver, ..."
            className="w-64 rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="tier" className="text-sm text-neutral-400">
            Physical tier
          </label>
          <select
            id="tier"
            name="tier"
            defaultValue={tier ?? ""}
            className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            <option value="">All tiers</option>
            {airportConfig.physicalTiers.map((t) => (
              <option key={t} value={t}>
                {tierLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900"
        >
          Search
        </button>
      </form>

      <AirportMap
        markers={results.map((a) => ({
          id: a.id,
          ident: a.ident,
          name: a.name,
          latitude: a.latitude,
          longitude: a.longitude,
        }))}
        styleUrl={env.NEXT_PUBLIC_MAP_STYLE_URL ?? DEFAULT_MAP_STYLE_URL}
      />

      <Card>
        {results.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No airports match. If the catalog is empty, run{" "}
            <code>pnpm --filter @oneworld/data-import-airports import</code>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4">Ident</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">City</th>
                  <th className="pb-2 pr-4">Tier</th>
                  <th className="pb-2 pr-4">Activity</th>
                </tr>
              </thead>
              <tbody>
                {results.map((airport) => (
                  <tr key={airport.id} className="border-t border-neutral-800">
                    <td className="py-2 pr-4">
                      <Link href={`/airports/${airport.id}`} className="text-neutral-100 underline">
                        {airport.ident}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-neutral-300">{airport.name}</td>
                    <td className="py-2 pr-4 text-neutral-400">
                      {airport.municipality ?? "-"}
                      {airport.regionCode ? `, ${airport.regionCode}` : ""}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge>{tierLabel(airport.physicalTier)}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-neutral-400">
                      {tierLabel(airport.activityClass)} ({airport.activityScore})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
