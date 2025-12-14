import { NextConfig } from 'next';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Get the local IP address for dev origins
const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.4.134:3000',
  'http://192.168.4.134',
  'https://192.168.4.134:3000',
  'https://192.168.4.134',
];

const config: NextConfig = {
  reactStrictMode: true,
  basePath: base,
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
        destination: base,
        permanent: true,
        basePath: false
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

export default config
