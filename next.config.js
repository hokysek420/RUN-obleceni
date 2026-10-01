/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'sharp'],
    outputFileTracingIncludes: {
      '/**': ['./data/run.db'],
    },
  },
  images: {
    unoptimized: true, // Local images served directly without external optimizer overhead
  },
};

module.exports = nextConfig;
