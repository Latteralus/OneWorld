import { app, Menu, Tray } from "electron";
import { createSimConnectAdapter } from "./simconnect/index.js";

/**
 * Tracker entrypoint (spec section 18.1, 20.1): a Windows tray app that
 * bridges MSFS/SimConnect to the cloud backend. Phase 0 only wires the
 * tray shell and the mock/real SimConnect selection - authentication,
 * flight-session binding, and telemetry upload land in Phase 5.
 */
let tray: Tray | undefined;

app.whenReady().then(async () => {
  tray = new Tray(getTrayIconPath());
  tray.setToolTip("OneWorld Tracker");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "OneWorld Tracker (not connected)", enabled: false },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );

  const adapter = createSimConnectAdapter();
  await adapter.connect();
  const info = await adapter.getSimulatorInfo();
  console.error(`[tracker] simulator info: ${JSON.stringify(info)}`);
});

app.on("window-all-closed", () => {
  // Tray apps have no windows to close by default - never quit on this event.
});

function getTrayIconPath(): string {
  // Placeholder path - a real icon asset is a Phase 5 UI deliverable.
  return new URL("../assets/tray-icon.png", import.meta.url).pathname;
}
