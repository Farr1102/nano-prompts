import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PicoTrex/Awesome-Nano-Banana-images/**",
      },
    ],
  },
};

export default nextConfig;
