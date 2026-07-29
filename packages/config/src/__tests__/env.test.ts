import { describe, expect, it, beforeEach } from "vitest";
import { loadEnv, _resetEnvCacheForTests } from "../env.js";

const validEnv = {
  NODE_ENV: "test",
  APP_ENV: "local",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:54322/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
} as NodeJS.ProcessEnv;

describe("loadEnv", () => {
  beforeEach(() => {
    _resetEnvCacheForTests();
  });

  it("parses a minimal valid environment and applies defaults", () => {
    const env = loadEnv(validEnv);
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.TRACKER_USE_MOCK_SIMCONNECT).toBe(true);
    expect(env.FEATURE_PASSENGER_JOBS_ENABLED).toBe(true);
  });

  it("throws a readable error when required variables are missing", () => {
    expect(() => loadEnv({} as NodeJS.ProcessEnv)).toThrow(/Invalid environment configuration/);
  });

  it("memoizes the parsed result across calls", () => {
    const first = loadEnv(validEnv);
    const second = loadEnv({} as NodeJS.ProcessEnv);
    expect(second).toBe(first);
  });
});
