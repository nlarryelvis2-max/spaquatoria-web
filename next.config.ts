import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spaquatoria.ru",
        pathname: "/wa-data/**",
      },
    ],
  },
};

export default nextConfig;
