import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.elephant.se",
      },
      {
        protocol: "https",
        hostname: "elephant.se",
      },
    ],
  },
};

export default nextConfig;
