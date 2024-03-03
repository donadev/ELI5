/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
        {
            source: '/api/:path*',
            destination:
            process.env.NODE_ENV === 'development'
                ? 'http://127.0.0.1:8000/api/:path*'
                : '/api/',
        },

        {
            source: '/socket.io',
            destination:
            process.env.NODE_ENV === 'development'
                ? 'http://127.0.0.1:8000/socket.io/'
                : '/socket.io/',
        },
        ]
  },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
            'supports-color': 'commonjs supports-color',
        })
        return config
    },
    env: {
        KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
        KV_REST_API_URL: process.env.KV_REST_API_URL,
        KV_URL: process.env.KV_URL,
        DEBUG: process.env.DEBUG
    }
}

module.exports = nextConfig
