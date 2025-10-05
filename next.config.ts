import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
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

// Only set outputFileTracingRoot locally to silence workspace-root warning; avoid on Vercel
if (!isVercel) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - this field may be added dynamically
  (nextConfig as any).outputFileTracingRoot = process.cwd();
}

export default nextConfig;
