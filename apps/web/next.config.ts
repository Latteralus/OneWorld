import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// Next.js compiles next.config.ts with its own minimal transpiler, separate
// from the main webpack pipeline (whose extensionAlias below lets our
// workspace packages' ".js"-specifier-for-a-".ts"-file convention resolve) -
// that means we cannot `import "@oneworld/config"` here to get its
// centralized env loading. Load the root .env directly instead so
// `NEXT_PUBLIC_*` vars are in `process.env` before webpack's DefinePlugin
// inlines them into the client bundle. A no-op on Vercel (no .env file;
// vars come from Project Settings) or once @oneworld/config's own module
// load has already populated `process.env` (dotenv never overrides).
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
