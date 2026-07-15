import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: {
          1: 'var(--color-surface-1)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)'
        },
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)'
        },
        signal: {
          DEFAULT: 'var(--color-violet)',
          bright: 'var(--color-violet-bright)',
          soft: 'var(--color-violet-soft)'
        }
      },
      fontFamily: {
        body: ['var(--font-body)'],
        display: ['var(--font-display)']
      },
      boxShadow: { panel: 'var(--shadow-panel)', violet: 'var(--shadow-violet)' }
    }
  },
  plugins: []
};

export default config;
