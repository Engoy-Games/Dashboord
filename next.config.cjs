/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path',
        destination: 'http://localhost:3000/api/:apiId/productPage', // Forward API requests to backend running on port 3000
      },
    ];
  },
};

module.exports = nextConfig;
