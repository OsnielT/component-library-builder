/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Set base path for GitHub Pages (update 'repo-name' to your actual repo name)
  // basePath: '/component-library-builder',
  // assetPrefix: '/component-library-builder/',
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
