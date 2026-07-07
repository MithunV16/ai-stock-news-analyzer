import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1419',
          raised: '#1a2332',
          border: '#2d3a4f',
        },
        accent: {
          bullish: '#22c55e',
          bearish: '#ef4444',
          neutral: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
