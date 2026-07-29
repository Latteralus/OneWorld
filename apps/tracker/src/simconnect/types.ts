/**
 * The boundary between the tracker app and the simulator (spec section
 * 18.1). A real implementation wraps a native SimConnect binding; the
 * mock implementation lets web/backend development proceed without MSFS
 * installed (spec section 36 item 15).
 */
export interface SimConnectSnapshot {
  timestamp: Date;
  latitude: number;
  longitude: number;
  altitudeMslFt: number;
  altitudeAglFt: number;
  groundSpeedKts: number;
  airspeedKts: number;
  verticalSpeedFpm: number;
  headingDegrees: number;
  onGround: boolean;
  engineRunning: boolean;
  parkingBrakeSet: boolean;
  fuelGallons: number;
  aircraftTitle: string;
  simRate: number;
  slew: boolean;
  paused: boolean;
  crashed: boolean;
}

export interface SimulatorInfo {
  connected: boolean;
  simulatorVersion?: string;
  aircraftTitle?: string;
}

export interface SimConnectAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getSimulatorInfo(): Promise<SimulatorInfo>;
  /** Subscribes to periodic telemetry (spec section 18.3). Returns an unsubscribe function. */
  onSnapshot(listener: (snapshot: SimConnectSnapshot) => void): () => void;
}
