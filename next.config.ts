import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Serwist injects a webpack() config for the production build (which runs
  // `next build --webpack`). `next dev` still runs on Turbopack, and an empty
  // turbopack block silences Turbopack's "unexpected webpack config" check.
  turbopack: {},
};

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist(nextConfig);
