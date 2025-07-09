/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Enable experimental features for real-time processing
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ['@tensorflow/tfjs-node', 'natural']
    },

    // Webpack configuration for audio processing
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        // Handle audio processing modules
        config.module.rules.push({
            test: /\.(wav|mp3|ogg|flac)$/,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next/static/audio/',
                    outputPath: 'static/audio/',
                },
            },
        });

        return config;
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'microphone=(), camera=()'
                    }
                ]
            }
        ];
    }
};

module.exports = nextConfig;