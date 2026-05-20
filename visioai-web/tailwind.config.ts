import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#13131A',
        card: '#1C1C27',
        border: '#2A2A38',
        primary: '#7C3AED',
        accent: '#06B6D4',
        'text-primary': '#F8F8FF',
        'text-secondary': '#9494A8',
        'text-muted': '#5A5A6E',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7C3AED, #5B21B6)',
        'gradient-accent': 'linear-gradient(135deg, #06B6D4, #0891B2)',
        'gradient-dark': 'linear-gradient(180deg, #13131A, #0A0A0F)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-sm': '0 0 10px rgba(124, 58, 237, 0.2)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
