// =============================================================================
// next.config.ts
// =============================================================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js not to bundle these packages — let Node.js require() them
  // at runtime instead. Required for pdf-parse which uses fs internals.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;