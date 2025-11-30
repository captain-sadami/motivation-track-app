import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
  },
};

module.exports = nextConfig;