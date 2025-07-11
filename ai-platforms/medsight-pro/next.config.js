/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['three', 'opencv-js'],
  },
  
  // Transpile shared packages
  transpilePackages: ['@g3dai/shared'],
  
  // Webpack configuration for medical imaging
  webpack: (config) => {
    // Handle medical imaging and 3D libraries
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag|wasm)$/,
      use: ['raw-loader'],
    });
    
    // Handle DICOM and medical formats
    config.module.rules.push({
      test: /\.(dcm|dicom)$/,
      type: 'asset/resource',
    });
    
    return config;
  },
  
  // Image optimization for medical images
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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3022',
    NEXT_PUBLIC_DICOM_API_URL: process.env.NEXT_PUBLIC_DICOM_API_URL || 'http://localhost:8042',
  },
  
  // Build configuration
  output: 'standalone',
  
  // Security headers for medical compliance
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
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 