/**
 * Design language: "Signal" — the platform's visual identity is built around
 * the idea of a live interview signal: a waveform/pulse motif (mic input,
 * confidence level, score) rendered in a deep ink background with an amber
 * "on-air" accent and a mint "cleared" success color. Typography pairs a
 * geometric technical display face with a warm, readable body face and a
 * monospace face for questions/timers/code — appropriate for a dev-interview
 * product.
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backed by CSS variables (see index.css :root / .dark) so every
        // component using these tokens automatically repaints on theme
        // toggle — no per-component `dark:` classes needed.
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)',
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
        },
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        neutral: 'rgb(var(--color-border) / <alpha-value>)',
        signal: {
          DEFAULT: '#FFB020',
          soft: '#FFD37A',
        },
        mint: {
          DEFAULT: '#3DDC97',
          soft: '#A6F0D2',
        },
        coral: '#FF6B5E',
        slate: {
          DEFAULT: 'rgb(var(--color-slate) / <alpha-value>)',
          light: 'rgb(var(--color-slate-light) / <alpha-value>)',
        },
        // Fixed, NOT theme-swapped: `ink`/`paper` flip meaning between light and
        // dark mode (see index.css), so anything that must stay dark-on-amber
        // regardless of theme (e.g. text on a signal-colored button) needs a
        // color that doesn't participate in that swap. Use `oninverse` for that.
        oninverse: '#12192B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,176,32,0.15), 0 8px 30px rgba(0,0,0,0.35)',
      },
      keyframes: {
        pulseBar: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseBar: 'pulseBar 1s ease-in-out infinite',
        floatUp: 'floatUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
