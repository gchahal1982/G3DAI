/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile shared packages
  transpilePackages: ['@g3dai/shared'],
  
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
