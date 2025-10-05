import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next.js traces files relative to this app's workspace root
  outputFileTracingRoot: "/home/aaqib/Desktop/gami-vault-test/gami-vaults",

  // Suppress optional dependencies not needed in the browser bundle
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Optional React Native storage used by some SDK paths; not needed on web
      "@react-native-async-storage/async-storage": false,
      // Pretty printer for Node-only logging; exclude from client bundles
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
