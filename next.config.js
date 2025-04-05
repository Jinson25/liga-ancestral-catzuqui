/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'www.atlantiasearch.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'alhenskfrlmnraaxqnzi.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
}

module.exports = nextConfig
