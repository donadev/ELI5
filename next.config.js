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
        DEBUG: process.env.DEBUG,
    }
}

module.exports = nextConfig
