import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GOOGLE_FONTS_API_URL: process.env.GOOGLE_FONTS_API_URL || 'https://fonts.googleapis.com',
  },
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: `${process.env.GOOGLE_FONTS_API_URL || 'https://fonts.googleapis.com'}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
