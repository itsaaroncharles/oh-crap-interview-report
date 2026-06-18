import type { NextConfig } from "next";

// Static export for GitHub Pages. The repo is served from a subpath
// (https://<user>.github.io/oh-crap-interview-report), so basePath is applied
// in CI via NEXT_PUBLIC_BASE_PATH. Locally it's empty, so dev/build stay at /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
