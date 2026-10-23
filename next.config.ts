import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '100.126.211.114',
    'localhost:3000',
    '127.0.0.1:3000',
    '*.ts.net'
  ],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.iposcore.kr' }],
        destination: 'https://iposcore.kr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
