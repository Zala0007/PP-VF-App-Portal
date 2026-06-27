/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/apply',
        destination: '/',
        permanent: false,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_ADMIN_PASSWORDS: process.env.NEXT_PUBLIC_ADMIN_PASSWORDS,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  allowedDevOrigins: ['192.168.56.1'],
}

module.exports = nextConfig
