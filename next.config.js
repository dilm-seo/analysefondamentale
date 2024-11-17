/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'better-sqlite3': false
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
}

module.exports = nextConfig;