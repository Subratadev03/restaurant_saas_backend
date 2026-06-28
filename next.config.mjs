/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['sequelize', 'pg', 'bcryptjs'],
  },
};

export default nextConfig;
