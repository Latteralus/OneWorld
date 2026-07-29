import { loadEnv } from "@oneworld/config";
import { Scheduler, consoleLogger } from "./scheduler.js";
import { allJobs } from "./jobs/index.js";

function main() {
  const env = loadEnv();
  consoleLogger.info({ event: "worker_starting", appEnv: env.APP_ENV, jobCount: allJobs.length });

  const scheduler = new Scheduler(allJobs, consoleLogger);
  scheduler.start();

  const shutdown = (signal: string) => {
    consoleLogger.info({ event: "worker_stopping", signal });
    scheduler.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main();
