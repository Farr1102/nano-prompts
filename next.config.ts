import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "pbs.twimg.com", pathname: "/**" },
      { protocol: "https", hostname: "cms-assets.youmind.com", pathname: "/**" },
      { protocol: "https", hostname: "github.com", pathname: "/**" },
      { protocol: "https", hostname: "bibigpt-apps.chatvid.ai", pathname: "/**" },
      { protocol: "https", hostname: "replicate.delivery", pathname: "/**" },
    ],
  },
};

export default nextConfig;
