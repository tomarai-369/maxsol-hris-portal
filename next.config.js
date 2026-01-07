/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    KINTONE_DOMAIN: process.env.KINTONE_DOMAIN,
  },
};

module.exports = nextConfig;
