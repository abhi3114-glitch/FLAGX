/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    800: '#065f46',
  },
  warning: {
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    800: '#92400e',
  },
  danger: {
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    800: '#991b1b',
  }
},
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}