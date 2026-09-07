/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jodo/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin/warehouse',
        destination: '/warehouse',
      },
    ];
  },
};

module.exports = nextConfig;
