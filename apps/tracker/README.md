# @oneworld/tracker

Windows desktop tracker: an Electron tray app bridging MSFS/SimConnect to
the cloud backend (spec section 18, 20.1).

## Structure

- `src/simconnect/types.ts` - the `SimConnectAdapter` interface, the
  boundary between this app and the simulator.
- `src/simconnect/mock-adapter.ts` - `MockSimConnectAdapter`, a linear-
  interpolation fake flight so web/backend development can proceed
  without MSFS installed (spec section 36 item 15). Real and unit tested.
- `src/simconnect/real-adapter.ts` - not implemented; wiring a native
  SimConnect binding is a Phase 5 deliverable.
- `src/simconnect/index.ts` - selects mock vs. real via
  `TRACKER_USE_MOCK_SIMCONNECT` (see repo root `.env.example`).
- `src/main.ts` - Electron entrypoint (tray icon shell only in Phase 0).

## Key invariants

- The tracker reports evidence; it never decides flight validity itself
  (section 18.1, 21.3) - that logic lives server-side in
  `@oneworld/domain-telemetry` and `@oneworld/domain-flights`.
- `SimConnectAdapter` is the only way app code touches the simulator -
  never call a SimConnect binding directly from UI or upload code, so the
  mock/real swap stays clean.

## Local development

```bash
pnpm --filter @oneworld/tracker dev
```

Runs against the mock adapter by default (`TRACKER_USE_MOCK_SIMCONNECT=true`).

## Testing

```bash
pnpm --filter @oneworld/tracker test
```

## Roadmap status

Phase 0 delivers the adapter interface, mock adapter, and tray shell.
Authentication, flight-session binding, telemetry upload, and the real
SimConnect bridge land in Phase 5 per the implementation roadmap.
