import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        md: '2rem',
      },
    },
    extend: {
      colors: {
        background: '#000000',
        surface: '#001a00',
        card: '#002200',
        accent: {
          DEFAULT: '#00ff41',
          foreground: '#000000',
        },
        neutral: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#00cc33',
          400: '#00aa2b',
          500: '#008822',
          600: '#006619',
          700: '#004411',
          800: '#002200',
          900: '#001100',
        },
        border: 'rgba(0, 255, 65, 0.2)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        xl: '1.25rem',
      },
      boxShadow: {
        glass: '0 40px 80px -20px rgba(0, 255, 65, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [typography],
};
