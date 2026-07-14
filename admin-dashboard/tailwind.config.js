/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
        warning: '#F97316',
        bg: {
          main: '#0F172A',
          card: '#1E293B',
          sidebar: '#020617',
          hover: '#334155'
        },
        text: {
          main: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B'
        },
        breaker: {
          closed: '#10B981',
          open: '#EF4444',
          halfopen: '#F59E0B'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
