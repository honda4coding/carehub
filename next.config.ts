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

// Dynamic revision ensures every new deploy invalidates the stale precached offline page
const buildRevision = `${Date.now()}`;

const finalConfig = isDev
  ? nextConfig
  : withSerwistInit({
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
      disable: false,
<<<<<<< HEAD
      additionalPrecacheEntries: [{ url: "/~offline", revision: "1" }],
=======
      reloadOnOnline: true,
      // Only precache /~offline — dashboard pages are auth-protected so they
      // can't be precached at build time. They get cached via defaultCache
      // when the user visits them.
      additionalPrecacheEntries: [
        { url: "/~offline", revision: buildRevision },
      ],
>>>>>>> c51e3111e9e4f8b5fa33ab76766acdf19c6fdaeb
    })(nextConfig);

export default finalConfig;
