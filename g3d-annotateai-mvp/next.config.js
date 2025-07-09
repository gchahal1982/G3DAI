/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Experimental features for performance
    experimental: {
        optimizeCss: true,
        scrollRestoration: true,
    },

    // Webpack configuration for AI models and WebGL
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Handle ONNX models and TensorFlow.js models
        config.module.rules.push({
            test: /\.(onnx|pb|json)$/,
            type: 'asset/resource',
        });

        // Handle WebAssembly files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
        });

        // Optimize for WebGL and AI libraries
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            crypto: false,
        };

        // Ignore node-specific modules in browser
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                module: false,
                perf_hooks: false,
            };
        }

        // Performance optimizations
        config.optimization = {
            ...config.optimization,
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                    tensorflow: {
                        test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
                        name: 'tensorflow',
                        chunks: 'all',
                        priority: 10,
                    },
                    three: {
                        test: /[\\/]node_modules[\\/]three[\\/]/,
                        name: 'three',
                        chunks: 'all',
                        priority: 10,
                    },
                },
            },
        };

        return config;
    },

    // Headers for WebGL and AI model loading
    async headers() {
        return [
            {
                source: '/models/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
            {
                source: '/:path*',
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

    // Redirects for API routes
    async redirects() {
        return [
            {
                source: '/api/v1/:path*',
                destination: '/api/:path*',
                permanent: true,
            },
        ];
    },

    // Image optimization
    images: {
        domains: ['localhost', 'example.com'],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
    },

    // Environment variables
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
        TENSORFLOW_BACKEND: 'webgl',
        WEBGL_VERSION: '2',
    },

    // Compression
    compress: true,

    // Power by header
    poweredByHeader: false,

    // Generate build ID
    generateBuildId: async () => {
        return `g3d-annotateai-${Date.now()}`;
    },

    // Output configuration for production
    output: 'standalone',

    // TypeScript configuration
    typescript: {
        ignoreBuildErrors: false,
    },

    // ESLint configuration
    eslint: {
        ignoreDuringBuilds: false,
    },
};

module.exports = nextConfig;