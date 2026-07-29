import { describe, expect, it } from "vitest";
import { MockSimConnectAdapter } from "../simconnect/mock-adapter.js";

const profile = {
  originLatitude: 43.5644,
  originLongitude: -116.2228,
  destinationLatitude: 44.8897,
  destinationLongitude: -116.0994,
  cruiseAltitudeFt: 8500,
  cruiseSpeedKts: 110,
  aircraftTitle: "Cessna 172 Skyhawk Asobo",
};

describe("MockSimConnectAdapter", () => {
  it("reports connection and simulator info", async () => {
    const adapter = new MockSimConnectAdapter(profile);
    await adapter.connect();
    const info = await adapter.getSimulatorInfo();
    expect(info.connected).toBe(true);
    expect(info.aircraftTitle).toBe(profile.aircraftTitle);
  });

  it("starts on the ground and ends on the ground, airborne in between", () => {
    const adapter = new MockSimConnectAdapter(profile, 10);

    const first = adapter.tick();
    expect(first.onGround).toBe(true);

    let sawAirborne = false;
    for (let i = 0; i < 9; i += 1) {
      const snapshot = adapter.tick();
      if (!snapshot.onGround) sawAirborne = true;
    }
    expect(sawAirborne).toBe(true);

    // 11th tick: elapsedTicks reaches totalTicks, so progress clamps to 1.0 and the profile lands.
    const last = adapter.tick();
    expect(last.onGround).toBe(true);
  });

  it("interpolates position from origin toward destination", () => {
    const adapter = new MockSimConnectAdapter(profile, 10);
    for (let i = 0; i < 5; i += 1) adapter.tick();
    const midpoint = adapter.tick();

    expect(midpoint.latitude).toBeGreaterThan(profile.originLatitude);
    expect(midpoint.latitude).toBeLessThan(profile.destinationLatitude);
  });

  it("notifies subscribed listeners on tick and supports unsubscribe", () => {
    const adapter = new MockSimConnectAdapter(profile, 10);
    const received: number[] = [];
    const unsubscribe = adapter.onSnapshot(() => received.push(1));

    adapter.tick();
    adapter.tick();
    unsubscribe();
    adapter.tick();

    expect(received).toHaveLength(2);
  });
});
