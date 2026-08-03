import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic / theme-aware ── */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        'muted-foreground': 'var(--muted-foreground)',

        /* ── Brand ── */
        emerald: {
          DEFAULT: 'var(--primary-emerald)',
          hover: 'var(--emerald-hover)',
        },
        mint: 'var(--neon-mint)',

        /* ── States ── */
        success: 'var(--kiosk-pass)',
        warning: 'var(--warning-amber)',
        error: 'var(--error-rose)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      boxShadow: {
        'phone-frame': '0 25px 60px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.3)',
        'pin-glow-green': '0 0 12px rgba(34,197,94,0.7)',
        'pin-glow-yellow': '0 0 12px rgba(245,158,11,0.7)',
        'pin-glow-red': '0 0 12px rgba(239,68,68,0.7)',
        card: '0 4px 20px rgba(0,0,0,0.05)',
      },
      backgroundImage: {
        'mint-pop': 'linear-gradient(135deg, var(--primary-emerald) 0%, var(--neon-mint) 50%, #22d3ee 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'count-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
