import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

const isDev = process.env.NODE_ENV === "development";

const finalConfig = isDev
  ? nextConfig
  : withSerwistInit({
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
      disable: false,
      additionalPrecacheEntries: [
        { url: "/offline.html", revision: "1" },
        { url: "/admin", revision: "1" },
        { url: "/admin/profile", revision: "1" },
        { url: "/doctor", revision: "1" },
        { url: "/doctor/profile", revision: "1" },
        { url: "/patient", revision: "1" },
        { url: "/patient/profile", revision: "1" },
      ],
    })(nextConfig);

export default finalConfig;
