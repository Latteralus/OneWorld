import { describe, expect, it } from "vitest";
import { asAirportId } from "@oneworld/contracts";
import { runAirportImport, type AirportImportSink } from "../import.js";
import { ourAirportsAdapter } from "../adapters/our-airports.adapter.js";

function makeFakeSink() {
  const upsertBatches: string[][] = [];
  const gameStateBatches: string[][] = [];
  const sink: AirportImportSink = {
    async upsertAirports(records) {
      upsertBatches.push(records.map((r) => r.record.ident));
      return new Map(records.map((r) => [r.record.ident, asAirportId(r.record.ident)]));
    },
    async ensureGameStates(inputs) {
      gameStateBatches.push(inputs.map((i) => i.airportId));
    },
  };
  return { sink, upsertBatches, gameStateBatches };
}

describe("runAirportImport", () => {
  it("normalizes, upserts, and initializes game state only for preview-eligible rows", async () => {
    const { sink, upsertBatches, gameStateBatches } = makeFakeSink();

    const summary = await runAirportImport(
      [
        {
          ident: "KBOI",
          type: "medium_airport",
          iso_country: "US",
          latitude_deg: 43.5,
          longitude_deg: -116.2,
        },
        {
          ident: "EGLL",
          type: "large_airport",
          iso_country: "GB",
          latitude_deg: 51.5,
          longitude_deg: -0.46,
        },
        { ident: "US-0001", type: "heliport", iso_country: "US" }, // unmapped tier
      ],
      ourAirportsAdapter,
      sink,
    );

    expect(summary).toEqual({
      totalRows: 3,
      normalized: 2, // KBOI + EGLL map to a tier; the heliport does not
      skippedUnmapped: 1,
      previewEnabled: 1, // only KBOI is US
    });
    expect(upsertBatches).toEqual([["KBOI", "EGLL"]]);
    expect(gameStateBatches).toEqual([["KBOI"]]);
  });

  it("splits large imports into multiple batches rather than one row at a time", async () => {
    const { sink, upsertBatches } = makeFakeSink();
    const rows = Array.from({ length: 1200 }, (_, i) => ({
      ident: `US-${i}`,
      type: "medium_airport",
      iso_country: "US",
      latitude_deg: 40,
      longitude_deg: -100,
    }));

    await runAirportImport(rows, ourAirportsAdapter, sink);

    expect(upsertBatches).toHaveLength(3); // 1200 rows / 500-row batches
    expect(upsertBatches[0]).toHaveLength(500);
    expect(upsertBatches[1]).toHaveLength(500);
    expect(upsertBatches[2]).toHaveLength(200);
  });

  it("is safe to run twice - the sink's upsert/ensure semantics make replay idempotent", async () => {
    const { sink, upsertBatches, gameStateBatches } = makeFakeSink();
    const rows = [
      {
        ident: "KBOI",
        type: "medium_airport",
        iso_country: "US",
        latitude_deg: 43.5,
        longitude_deg: -116.2,
      },
    ];

    await runAirportImport(rows, ourAirportsAdapter, sink);
    await runAirportImport(rows, ourAirportsAdapter, sink);

    // The orchestrator calls upsert/ensure both times (idempotency is the sink's job,
    // exercised by the real Drizzle repository's onConflictDoUpdate/onConflictDoNothing) -
    // here we just confirm it doesn't skip the second run outright.
    expect(upsertBatches).toEqual([["KBOI"], ["KBOI"]]);
    expect(gameStateBatches).toEqual([["KBOI"], ["KBOI"]]);
  });
});
