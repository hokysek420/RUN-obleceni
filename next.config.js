/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'sharp'],
  },
  images: {
    unoptimized: true, // Local images served directly without external optimizer overhead
  },
};

module.exports = nextConfig;
