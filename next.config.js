/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com']
  },
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres']
  }
}

module.exports = nextConfig