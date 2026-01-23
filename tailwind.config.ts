import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0b0e14',
          900: '#101622',
          800: '#151f2e',
          700: '#1c2a3c'
        },
        ember: {
          500: '#ff7a1a',
          600: '#e66712'
        },
        ice: {
          400: '#5dd2ff',
          500: '#2fb7ff'
        },
        steel: {
          200: '#a6b3c2',
          300: '#8fa1b5',
          400: '#7c90a6'
        }
      },
      fontFamily: {
        body: ['var(--font-body)'],
        display: ['var(--font-display)']
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 122, 26, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;
