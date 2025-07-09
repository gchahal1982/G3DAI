/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,

    // Enable experimental features for medical imaging
    experimental: {
        serverActions: true,
        optimizeCss: true,
    },

    // Security headers for HIPAA compliance
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' wss: https:;"
                    }
                ]
            }
        ]
    },

    // Webpack configuration for medical imaging libraries
    webpack: (config, { isServer }) => {
        // Handle WASM files for DICOM parsing
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async'
        });

        // Resolve Node.js modules for TensorFlow.js
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        return config;
    },

    // Image optimization for medical images
    images: {
        domains: ['localhost', 'medical-assets.g3d.ai'],
        formats: ['image/webp'],
        minimumCacheTTL: 60,
    },
}

module.exports = nextConfig