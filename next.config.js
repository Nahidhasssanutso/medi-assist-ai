/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'export', // Enable static export
  trailingSlash: true, // Recommended for static hosting
  distDir: 'out', // Output directory for static files
  swcMinify: false, // Disable SWC minifier to avoid binary issues
  experimental: {
    // Remove swc-related experimental features
  },
  // Add basePath if needed for subdirectory deployment
  // basePath: '/your-subdirectory',
  
};

module.exports = nextConfig;