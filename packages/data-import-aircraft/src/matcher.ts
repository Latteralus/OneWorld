import { previewAircraftTypeSeeds } from "@oneworld/config";
import type { SimulatorAircraftMapping, SimulatorAircraftSignal } from "./types.js";

/**
 * Resolves a tracker-reported simulator aircraft signal against known
 * mappings (spec section 16.4). Detection alone never approves an
 * aircraft for paid jobs (16.1) - callers must check `status !==
 * "unsupported"` before allowing a job to use it.
 */
export function matchSimulatorAircraft(
  signal: SimulatorAircraftSignal,
  knownMappings: SimulatorAircraftMapping[],
): SimulatorAircraftMapping {
  const exact = knownMappings.find(
    (mapping) => mapping.simulatorTitle.toLowerCase() === signal.simulatorTitle.toLowerCase(),
  );
  if (exact) return exact;

  const inferredType = signal.icaoTypeHint
    ? previewAircraftTypeSeeds.find(
        (seed) => seed.icaoType.toLowerCase() === signal.icaoTypeHint?.toLowerCase(),
      )
    : undefined;

  if (inferredType) {
    return {
      simulatorTitle: signal.simulatorTitle,
      canonicalIcaoType: inferredType.icaoType,
      status: "automatically_inferred",
    };
  }

  return {
    simulatorTitle: signal.simulatorTitle,
    canonicalIcaoType: "UNKNOWN",
    status: "unsupported",
  };
}
