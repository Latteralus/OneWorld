import { z } from "zod";

/**
 * Validated process environment. Import `env` instead of reading
 * `process.env` directly so every app fails fast on misconfiguration
 * rather than surfacing undefined values deep in domain logic.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["local", "preview", "production"]).default("local"),

  DATABASE_URL: z.string().min(1),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_MAP_TILE_PROVIDER: z.string().default("maplibre-demo"),
  NEXT_PUBLIC_MAP_STYLE_URL: z.string().url().optional(),

  ADMIN_APP_URL: z.string().url().default("http://localhost:3100"),
  ADMIN_SESSION_SECRET: z.string().min(1).optional(),

  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  WORKER_LOCK_TTL_MS: z.coerce.number().int().positive().default(60000),

  TRACKER_JWT_SECRET: z.string().min(1).optional(),
  TRACKER_MIN_SUPPORTED_VERSION: z.string().default("0.1.0"),
  TRACKER_USE_MOCK_SIMCONNECT: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  FEATURE_PASSENGER_JOBS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  FEATURE_GROUND_VEHICLE_FUEL_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  FEATURE_EMPLOYMENT_APPLICATIONS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  FEATURE_INSTRUMENT_TRAINING_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  FEATURE_MULTI_ENGINE_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  FEATURE_AIRPORT_ACTIVITY_DECAY_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  FEATURE_TRACKER_PAYLOAD_LOCK_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/**
 * Parses and validates `process.env` on first call and caches the result.
 * Throws with a readable message if required variables are missing -
 * intentional: a misconfigured deploy should fail at boot, not mid-flight
 * settlement.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/** Test-only helper to reset the memoized env between test cases. */
export function _resetEnvCacheForTests(): void {
  cachedEnv = undefined;
}
