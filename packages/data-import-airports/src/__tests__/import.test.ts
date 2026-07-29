import { describe, expect, it } from "vitest";
import { asAirportId } from "@oneworld/contracts";
import { runAirportImport, type AirportImportSink } from "../import.js";
import { ourAirportsAdapter } from "../adapters/our-airports.adapter.js";

function makeFakeSink() {
  const upserted: string[] = [];
  const gameStateInitialized: string[] = [];
  const sink: AirportImportSink = {
    async upsertAirport(record) {
      upserted.push(record.ident);
      return asAirportId(record.ident);
    },
    async ensureGameState(airportId) {
      gameStateInitialized.push(airportId);
    },
  };
  return { sink, upserted, gameStateInitialized };
}

describe("runAirportImport", () => {
  it("normalizes, upserts, and initializes game state only for preview-eligible rows", async () => {
    const { sink, upserted, gameStateInitialized } = makeFakeSink();

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
    expect(upserted).toEqual(["KBOI", "EGLL"]);
    expect(gameStateInitialized).toEqual(["KBOI"]);
  });

  it("is safe to run twice - the sink's upsert/ensure semantics make replay idempotent", async () => {
    const { sink, upserted, gameStateInitialized } = makeFakeSink();
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
    expect(upserted).toEqual(["KBOI", "KBOI"]);
    expect(gameStateInitialized).toEqual(["KBOI", "KBOI"]);
  });
});
