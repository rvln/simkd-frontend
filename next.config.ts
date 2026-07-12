import type { NextConfig } from "next";

const apiHostname = process.env.NEXT_PUBLIC_API_HOSTNAME || "localhost";
const apiProtocol =
  (process.env.NEXT_PUBLIC_API_PROTOCOL as "http" | "https") || "http";
const apiPort = process.env.NEXT_PUBLIC_API_PORT || "8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        port: apiPort,
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
