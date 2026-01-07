/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    KINTONE_DOMAIN: process.env.KINTONE_DOMAIN,
  },
};

module.exports = nextConfig;
