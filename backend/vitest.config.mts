import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@config': path.resolve(rootDir, './src/config'),
      '@routes': path.resolve(rootDir, './src/routes'),
      '@controllers': path.resolve(rootDir, './src/controllers'),
      '@services': path.resolve(rootDir, './src/services'),
      '@jobs': path.resolve(rootDir, './src/jobs'),
      '@ai': path.resolve(rootDir, './src/ai'),
      '@socket': path.resolve(rootDir, './src/socket'),
      '@utils': path.resolve(rootDir, './src/utils'),
      '@middleware': path.resolve(rootDir, './src/middleware'),
      '@types': path.resolve(rootDir, './src/types'),
    },
  },
});
