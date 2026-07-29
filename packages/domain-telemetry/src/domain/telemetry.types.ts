import type { FlightSessionId } from "@oneworld/contracts";

/** One periodic telemetry sample (spec section 18.3). */
export interface TelemetrySample {
  flightSessionId: FlightSessionId;
  sequence: number;
  timestamp: Date;
  latitude: number;
  longitude: number;
  altitudeMslFt: number;
  groundSpeedKts: number;
  onGround: boolean;
  engineRunning: boolean;
  fuelGallons: number;
  simRate: number;
  slew: boolean;
  paused: boolean;
}
