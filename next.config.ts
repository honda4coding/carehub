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
    })(nextConfig);

export default finalConfig;
