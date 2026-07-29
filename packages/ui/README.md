# @oneworld/ui

Shared React UI primitives for `apps/web` and `apps/admin` (spec section 26.1).

## Ownership

Presentational components only - no authoritative economic, travel,
qualification, or passenger formulas (spec section 20.4: "React components
must not contain authoritative...formulas"). Components accept already-
computed values (e.g. a formatted USD string from
`@oneworld/utils#formatUsd`) as props.

## Public API

```ts
import { Card, StatCard, Badge } from "@oneworld/ui";
import "@oneworld/ui/styles.css";
```

## Design direction

Modern persistent browser-game / aviation dashboard feel - status cards,
maps, tables, timelines, progress bars, transaction summaries (section
26.1). Not a spreadsheet dump, not a 3D life simulator.

## Testing

```bash
pnpm --filter @oneworld/ui test
```

No component tests yet (Phase 0 scaffolding only) - `passWithNoTests` is
enabled in the shared Vitest config so this is not a CI failure.
