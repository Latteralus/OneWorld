import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@oneworld/ui",
    "@oneworld/config",
    "@oneworld/contracts",
    "@oneworld/db",
    "@oneworld/domain-airports",
    "@oneworld/domain-finance",
    "@oneworld/domain-jobs",
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
