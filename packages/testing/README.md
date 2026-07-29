# @oneworld/testing

Shared Vitest configuration and deterministic fixtures (spec section 30.6).

## Public API

- `vitest-base.ts` exports `baseVitestConfig` and `extendVitestConfig()`.
  Every package's `vitest.config.ts` should be:

  ```ts
  import { extendVitestConfig } from "@oneworld/testing/vitest-base";
  export default extendVitestConfig({ /* package-specific overrides */ });
  ```

- `src/fixtures/*` exports deterministic test data (a small preview airport
  region, a fixture player) shared across unit, integration, and e2e tests
  so distances and expected outcomes stay consistent everywhere they're
  asserted.

## Testing

This package has no tests of its own - it is test infrastructure consumed
by every other package.
