import type { NextConfig } from 'next';
import { getPath } from './lib/path';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/market-access';
const config: NextConfig = {
  reactStrictMode: true,

  // ✅ THIS IS ALL YOU NEED
  basePath: basePath,

  reactCompiler: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : '',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: basePath,
        permanent: true,
        basePath: false,
      },
    ];
  },

  experimental: {
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: 104857600,
    },
  },
};

export default config;
