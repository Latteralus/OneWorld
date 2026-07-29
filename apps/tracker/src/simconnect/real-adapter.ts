import type { SimConnectAdapter, SimConnectSnapshot, SimulatorInfo } from "./types.js";

/**
 * Real MSFS SimConnect bridge. Not implemented in Phase 0 - wiring a
 * native SimConnect binding (e.g. `node-simconnect`) is a Phase 5
 * (Aircraft and Tracker Integration) deliverable. Selected automatically
 * when `TRACKER_USE_MOCK_SIMCONNECT=false` (see `src/simconnect/index.ts`).
 */
export class RealSimConnectAdapter implements SimConnectAdapter {
  async connect(): Promise<void> {
    throw new Error("RealSimConnectAdapter is not implemented yet (roadmap Phase 5).");
  }

  async disconnect(): Promise<void> {
    // no-op until implemented
  }

  async getSimulatorInfo(): Promise<SimulatorInfo> {
    return { connected: false };
  }

  onSnapshot(_listener: (snapshot: SimConnectSnapshot) => void): () => void {
    return () => {};
  }
}
