import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../..");

// Next.js only auto-loads .env files from its own directory (apps/web), but
// this monorepo keeps a single .env at the repo root (README "Setup", spec
// section 22.1) - load it explicitly so `next dev`/`next build`/`next start`
// see the same variables every other app/package does via @oneworld/config#loadEnv.
// A no-op on Vercel, where env vars come from Project Settings, not a file.
loadDotenv({ path: path.resolve(monorepoRoot, ".env") });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pins the file-tracing root to this monorepo explicitly. Without this,
  // Next.js infers it by walking up for the nearest lockfile and can pick
  // the wrong one on a machine with a stray lockfile above the repo (seen
  // locally; on Vercel a wrong root can silently drop workspace-package
  // files from a serverless function's deployment bundle).
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: [
    "@oneworld/ui",
    "@oneworld/config",
    "@oneworld/contracts",
    "@oneworld/db",
    "@oneworld/domain-airports",
    "@oneworld/domain-finance",
    "@oneworld/domain-housing",
    "@oneworld/domain-jobs",
    "@oneworld/domain-locations",
    "@oneworld/domain-players",
    "@oneworld/domain-qualifications",
    "@oneworld/domain-vehicles",
    "@oneworld/utils",
  ],
  webpack(config) {
    // Workspace packages import with explicit ".js" specifiers that
    // actually resolve to ".ts" source files (standard TS/ESM "Bundler"
    // moduleResolution convention, spec section 20.2 monorepo). Webpack
    // needs this alias to follow that convention across transpilePackages.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
