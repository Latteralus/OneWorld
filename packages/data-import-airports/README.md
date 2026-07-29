# @oneworld/data-import-airports

Import adapters that normalize external airport datasets into the
canonical OneWorld airport model (spec section 12.1).

## Ownership

This package owns **normalization only** - turning a raw external row
into a `CanonicalAirportRecord`. It does not own the `airports` table
(that's `@oneworld/db`) or airport game state (`@oneworld/domain-airports`).
The import _job_ that reads a dataset, calls an adapter, and upserts into
Postgres is a worker responsibility (spec section 25.1), not this
package's.

## Public API

```ts
import { ourAirportsAdapter } from "@oneworld/data-import-airports";
import type { AirportImportAdapter, CanonicalAirportRecord } from "@oneworld/data-import-airports";
```

## Key invariants

- Never hand-enter the global airport catalog (section 12.1) - all rows
  come from an adapter.
- Each adapter documents its source in `SOURCES.md` (provenance, license,
  update frequency, field mapping, data-quality limitations) before it is
  wired into a production import job.
- `normalize()` returns `undefined` for rows that don't map to a supported
  physical tier (e.g. heliports, closed airports) rather than guessing.

## Roadmap status

Phase 0 delivers the adapter interface and one working adapter
(OurAirports). The scheduled import job and `preview_enabled` curation
land in Phase 1 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/data-import-airports test
```
