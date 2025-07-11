/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['three'],
  },
  
  // Transpile shared packages
  transpilePackages: ['@g3dai/shared'],
  
  // Webpack configuration
  webpack: (config) => {
    // Handle three.js and other WebGL libraries
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021',
  },
  
  // Build configuration
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;