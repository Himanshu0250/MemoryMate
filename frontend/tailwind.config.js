/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        electric: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        dark: {
          950: '#07090E',
          900: '#0B0F17',
          850: '#0F1523',
          800: '#151E2E',
          750: '#1C263A',
          700: '#24324A',
          600: '#334460',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
        'glow': '0 0 25px -3px rgba(139, 92, 246, 0.35)',
        'glow-lg': '0 0 35px -3px rgba(139, 92, 246, 0.45)',
        'glow-cyan': '0 0 25px -3px rgba(14, 165, 233, 0.35)',
        'glow-rose': '0 0 25px -3px rgba(244, 63, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
