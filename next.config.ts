import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ouch-cdn2.icons8.com",
      }, {
        protocol: "https",
        hostname: "kalender.hmpstiub.web.id"
      }
    ],
  },
};

export default nextConfig;
