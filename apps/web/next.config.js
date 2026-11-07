/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@minecraftcloud/database',
    '@minecraftcloud/minecraft',
    '@minecraftcloud/auth',
    '@minecraftcloud/api',
    '@minecraftcloud/ui',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        dns: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
