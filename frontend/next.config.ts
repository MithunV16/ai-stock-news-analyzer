import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Avoid OneDrive file-lock issues on Windows by keeping build output under node_modules
  distDir: 'node_modules/.cache/next',
  outputFileTracingRoot: path.join(__dirname),
  // standalone is for Docker production builds only — enable via NEXT_OUTPUT=standalone
  ...(process.env.NEXT_OUTPUT === 'standalone' ? { output: 'standalone' as const } : {}),
};

export default nextConfig;
