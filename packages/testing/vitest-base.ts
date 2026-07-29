import { defineConfig, mergeConfig, type UserConfig } from "vitest/config";

/**
 * Shared Vitest defaults. Individual packages call
 * `mergeConfig(baseVitestConfig, defineConfig({ ... }))` from their own
 * vitest.config.ts so overrides stay local and explicit.
 */
export const baseVitestConfig = defineConfig({
  test: {
    environment: "node",
    globals: false,
    restoreMocks: true,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },
  },
});

export function extendVitestConfig(overrides: UserConfig): UserConfig {
  return mergeConfig(baseVitestConfig, overrides);
}
