/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['production-chani-web-f5e5589aaeda.herokuapp.com'],
  },
  // Allow iframe embedding for WordPress
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allows embedding in same origin, or use 'ALLOWALL' for any origin
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *;", // Allows embedding from any origin
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

