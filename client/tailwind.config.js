/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E', // secondary green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D', // primary forest green
          950: '#052E16',
        },
        surface: {
          light: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        brandText: {
          primary: '#1F2937',
          muted: '#64748B',
        },
        accent: {
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          success: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
