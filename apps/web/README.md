# @oneworld/web

The player-facing web dashboard (spec section 20.1, 26). Next.js App
Router, deployed to Vercel or equivalent.

## Structure

- `app/` - routes. `app/dashboard` is the only real page so far; the rest
  of `PrimaryNav`'s links (section 26.2) are placeholders that will 404
  until their roadmap phase lands.
- `components/` - app-local components. Shared, reusable primitives belong
  in `@oneworld/ui` instead.

## Key invariant

No authoritative economic, travel, qualification, or passenger formula may
live in this app (spec section 20.4) - pages call into domain packages
(`@oneworld/domain-*`) for calculations and read config from
`@oneworld/config`, never reimplementing rules inline.

## Local development

```bash
pnpm --filter @oneworld/web dev
```

Requires the root `.env` to be populated (see repo root `.env.example`) -
`@oneworld/config#loadEnv()` fails fast if required variables are missing.

## Testing

```bash
pnpm --filter @oneworld/web test
```
