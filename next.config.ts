import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Minimize caching in development (30s is the minimum)
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      staleTimes: {
        dynamic: 30,
        static: 30,
      },
    },
  }),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'uaednwpxursknmwdeejn.supabase.co',
      },
    ],
  },
};

export default nextConfig;
