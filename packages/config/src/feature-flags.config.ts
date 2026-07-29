import { loadEnv } from "./env.js";

/**
 * Feature flags for incomplete modules and staged rollout (spec 22.3).
 * These gate rollout, not module boundaries - do not use flags in place
 * of clean domain interfaces.
 */
export function getFeatureFlags(source: NodeJS.ProcessEnv = process.env) {
  const env = loadEnv(source);
  return {
    passenger_jobs_enabled: env.FEATURE_PASSENGER_JOBS_ENABLED,
    ground_vehicle_fuel_enabled: env.FEATURE_GROUND_VEHICLE_FUEL_ENABLED,
    employment_applications_enabled: env.FEATURE_EMPLOYMENT_APPLICATIONS_ENABLED,
    instrument_training_enabled: env.FEATURE_INSTRUMENT_TRAINING_ENABLED,
    multi_engine_enabled: env.FEATURE_MULTI_ENGINE_ENABLED,
    airport_activity_decay_enabled: env.FEATURE_AIRPORT_ACTIVITY_DECAY_ENABLED,
    tracker_payload_lock_enabled: env.FEATURE_TRACKER_PAYLOAD_LOCK_ENABLED,
  } as const;
}

export type FeatureFlags = ReturnType<typeof getFeatureFlags>;
