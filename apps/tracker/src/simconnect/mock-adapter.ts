import { trackerConfig } from "@oneworld/config";
import type { SimConnectAdapter, SimConnectSnapshot, SimulatorInfo } from "./types.js";

export interface MockFlightProfile {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  cruiseAltitudeFt: number;
  cruiseSpeedKts: number;
  aircraftTitle: string;
}

/**
 * Simulates a simple straight-line flight so web/backend/telemetry-
 * pipeline development can proceed without MSFS installed (spec section
 * 36 item 15). Not a physics engine - linear interpolation only.
 */
export class MockSimConnectAdapter implements SimConnectAdapter {
  private connected = false;
  private listeners = new Set<(snapshot: SimConnectSnapshot) => void>();
  private intervalHandle?: ReturnType<typeof setInterval>;
  private elapsedTicks = 0;

  constructor(
    private readonly profile: MockFlightProfile,
    private readonly totalTicks = 60,
  ) {}

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.listeners.clear();
  }

  async getSimulatorInfo(): Promise<SimulatorInfo> {
    return {
      connected: this.connected,
      simulatorVersion: "mock-2024",
      aircraftTitle: this.profile.aircraftTitle,
    };
  }

  onSnapshot(listener: (snapshot: SimConnectSnapshot) => void): () => void {
    this.listeners.add(listener);
    if (!this.intervalHandle) {
      this.intervalHandle = setInterval(
        () => this.tick(),
        trackerConfig.telemetry.intervalSeconds * 1000,
      );
    }
    return () => this.listeners.delete(listener);
  }

  /** Advances one tick and notifies listeners. Exposed directly for deterministic unit tests. */
  tick(): SimConnectSnapshot {
    const progress = Math.min(1, this.elapsedTicks / this.totalTicks);
    const snapshot = this.buildSnapshot(progress);
    this.elapsedTicks += 1;
    for (const listener of this.listeners) listener(snapshot);
    return snapshot;
  }

  private buildSnapshot(progress: number): SimConnectSnapshot {
    const { originLatitude, originLongitude, destinationLatitude, destinationLongitude } =
      this.profile;
    const isAirborne = progress > 0.02 && progress < 0.98;

    return {
      timestamp: new Date(),
      latitude: originLatitude + (destinationLatitude - originLatitude) * progress,
      longitude: originLongitude + (destinationLongitude - originLongitude) * progress,
      altitudeMslFt: isAirborne ? this.profile.cruiseAltitudeFt : 0,
      altitudeAglFt: isAirborne ? this.profile.cruiseAltitudeFt : 0,
      groundSpeedKts: isAirborne ? this.profile.cruiseSpeedKts : 0,
      airspeedKts: isAirborne ? this.profile.cruiseSpeedKts : 0,
      verticalSpeedFpm: 0,
      headingDegrees: 0,
      onGround: !isAirborne,
      engineRunning: progress > 0.01 && progress < 0.99,
      parkingBrakeSet: progress <= 0.01 || progress >= 0.99,
      fuelGallons: 40 - progress * 10,
      aircraftTitle: this.profile.aircraftTitle,
      simRate: 1,
      slew: false,
      paused: false,
      crashed: false,
    };
  }
}
