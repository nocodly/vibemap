/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme palette — VS Code meets Linear
        bg: {
          base: '#0d0d0d',
          surface: '#141414',
          elevated: '#1a1a1a',
          hover: '#222222',
          border: '#2a2a2a',
        },
        accent: {
          DEFAULT: '#7c6af7',
          hover: '#6b59e8',
          muted: 'rgba(124, 106, 247, 0.15)',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#888888',
          muted: '#555555',
        },
        // Semantic block colors
        block: {
          auth: '#f97316',
          db: '#3b82f6',
          api: '#10b981',
          ui: '#a855f7',
          config: '#f59e0b',
          util: '#6b7280',
          payment: '#ec4899',
          test: '#84cc16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
