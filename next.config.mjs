/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: {
    // Re-enable in CI/local to catch issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },
}

let nextConfig = baseConfig

// Enable bundle analyzer when ANALYZE=1
if (process.env.ANALYZE === '1' || process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })
  nextConfig = withBundleAnalyzer(baseConfig)
}

export default nextConfig
