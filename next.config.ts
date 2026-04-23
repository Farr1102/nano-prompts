import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
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
