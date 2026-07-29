import type { aircraftConfig } from "@oneworld/config";

export type MappingStatus = (typeof aircraftConfig.mappingStatuses)[number];

/** Raw signal reported by the tracker about an installed simulator aircraft (spec section 16.1, 16.4). */
export interface SimulatorAircraftSignal {
  simulatorTitle: string;
  packageName?: string;
  simulatorVersion?: string;
  icaoTypeHint?: string;
}

export interface SimulatorAircraftMapping {
  simulatorTitle: string;
  canonicalIcaoType: string;
  status: MappingStatus;
}
