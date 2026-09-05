/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Sanity's image CDN — used by annotatedImage lesson blocks via
        // next/image. Without this, next/image rejects the URL outright.
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
