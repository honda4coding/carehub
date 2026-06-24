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

// Use a build-time timestamp so every deploy invalidates old precache entries
const buildRevision = `${Date.now()}`;

const finalConfig = isDev
  ? nextConfig
  : withSerwistInit({
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
      disable: false,
      additionalPrecacheEntries: [
        { url: "/~offline", revision: buildRevision },
        { url: "/admin", revision: buildRevision },
        { url: "/admin/profile", revision: buildRevision },
        { url: "/doctor", revision: buildRevision },
        { url: "/doctor/profile", revision: buildRevision },
        { url: "/patient", revision: buildRevision },
        { url: "/patient/profile", revision: buildRevision },
      ],
    })(nextConfig);

export default finalConfig;
