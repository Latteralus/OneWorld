import { loadEnv } from "@oneworld/config";
import type { SimConnectAdapter } from "./types.js";
import { MockSimConnectAdapter, type MockFlightProfile } from "./mock-adapter.js";
import { RealSimConnectAdapter } from "./real-adapter.js";

const DEFAULT_MOCK_PROFILE: MockFlightProfile = {
  originLatitude: 43.5644,
  originLongitude: -116.2228,
  destinationLatitude: 44.8897,
  destinationLongitude: -116.0994,
  cruiseAltitudeFt: 8500,
  cruiseSpeedKts: 110,
  aircraftTitle: "Cessna 172 Skyhawk Asobo",
};

/** Selects the mock or real adapter based on `TRACKER_USE_MOCK_SIMCONNECT` (spec section 36 item 15). */
export function createSimConnectAdapter(): SimConnectAdapter {
  const env = loadEnv();
  return env.TRACKER_USE_MOCK_SIMCONNECT
    ? new MockSimConnectAdapter(DEFAULT_MOCK_PROFILE)
    : new RealSimConnectAdapter();
}

export * from "./types.js";
export * from "./mock-adapter.js";
export * from "./real-adapter.js";
