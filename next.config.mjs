/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": ["**/.git/**", "**/.next/cache/**"],
    },
  },
}

export default nextConfig
