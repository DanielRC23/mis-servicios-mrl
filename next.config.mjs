/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-checkbox'],
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  generateBuildId: async () => {
    return 'mis-servicios-mrl-build'
  },
  trailingSlash: false,
  poweredByHeader: false,
}

export default nextConfig
