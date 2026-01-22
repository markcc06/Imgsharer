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
  async redirects() {
    return [
      {
        source: "/blog/selfie-makeup-use-case",
        destination: "/blog/how-to-unblur-a-picture-on-iphone-selfie-makeup",
        permanent: true, // uses 308
      },
    ]
  },
}

export default nextConfig
