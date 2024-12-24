import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Config options */
  output: "standalone",
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'host', value: 'www.tdifielddays.com' }],
        destination: 'https://tdifielddays.com/:path*',
        permanent: true,
      },
    ];
  },
};


export default nextConfig;


