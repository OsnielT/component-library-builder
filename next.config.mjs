/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Set base path for GitHub Pages only in production
  basePath: process.env.NODE_ENV === 'production' ? '/component-library-builder' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/component-library-builder/' : '',
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
