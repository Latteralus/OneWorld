# @oneworld/data-import-airports

Import adapters that normalize external airport datasets into the
canonical OneWorld airport model (spec section 12.1).

## Ownership

This package owns **normalization and the import run** - turning a raw
external row into a `CanonicalAirportRecord`, deciding preview
eligibility, and upserting into the canonical `airports` table (identity
only). It does not own `airport_game_state` - that's
`@oneworld/domain-airports`, which this package calls into
(`AirportService.ensureGameState`) once per preview-enabled airport so
game state initialization stays behind that domain's own service
boundary (spec section 24.1).

Airport import isn't in the worker's fixed section-25.1 job list, so it
isn't registered with `apps/worker`'s `Scheduler` - it's a standalone,
idempotent script run manually or via an external cron.

## Public API

```ts
import {
  ourAirportsAdapter,
  parseCsv,
  isPreviewEligible,
  runAirportImport,
} from "@oneworld/data-import-airports";
import type {
  AirportImportAdapter,
  CanonicalAirportRecord,
  AirportImportSink,
} from "@oneworld/data-import-airports";
```

Run an import:

```bash
pnpm --filter @oneworld/data-import-airports import-airports
# override the source: AIRPORT_IMPORT_SOURCE_URL=... pnpm --filter @oneworld/data-import-airports import-airports
```

## Key invariants

- Never hand-enter the global airport catalog (section 12.1) - all rows
  come from an adapter.
- Each adapter documents its source in `SOURCES.md` (provenance, license,
  update frequency, field mapping, data-quality limitations) before it is
  wired into a production import job.
- `normalize()` returns `undefined` for rows that don't map to a supported
  physical tier (e.g. heliports, closed airports) rather than guessing.
- `isPreviewEligible` resolves spec section 35 open item #2
  ("preview region vs. worldwide airports") as a placeholder: active +
  U.S.-country-code airports are preview-enabled. See
  `@oneworld/config`'s `airportConfig.previewCountryCodes`.
- `runAirportImport` is safe to run repeatedly - every write it triggers
  is an upsert (`airports`, keyed on `ident`) or an idempotent ensure
  (`airport_game_state`), never a duplicate insert (section 25.2).

## Roadmap status

Phase 0 delivered the adapter interface and the OurAirports adapter.
Phase 1 adds `parseCsv`, `isPreviewEligible`, `runAirportImport`, the
Drizzle-backed catalog writer, and the runnable `import` script - the
airport importer and `preview_enabled` curation called for by the
roadmap.

## Testing

```bash
pnpm --filter @oneworld/data-import-airports test
```

`csv.test.ts`/`preview.test.ts`/`import.test.ts` cover parsing, curation,
and orchestration with fakes (no database). The `import` script itself
was manually verified against the live OurAirports export mirror
(85,817 rows -> 47,975 normalized -> 16,171 U.S. preview-enabled) - see
`SOURCES.md`.
