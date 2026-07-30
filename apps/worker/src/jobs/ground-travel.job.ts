import { getDb } from "@oneworld/db";
import { runGroundTravelCompletionSweep } from "@oneworld/domain-travel";
import { nowUtc } from "@oneworld/utils";
import type { JobContext, WorkerJob } from "../scheduler.js";

/**
 * Completes ground travel whose `arrives_at` has passed (spec section
 * 25.1, 25.3) - authoritative so travel completes without an open browser
 * (5.3), not a client timer.
 */
export const groundTravelCompletionJob: WorkerJob = {
  name: "ground-travel-completion",
  intervalMs: 30_000,
  async run(_ctx: JobContext) {
    await runGroundTravelCompletionSweep(getDb(), nowUtc());
  },
};
