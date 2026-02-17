/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#2D5016', light: '#4A7C2D' },
        sage: { DEFAULT: '#8B9A6B', muted: '#A8B89B', dark: '#6B8E5F' },
        moss: { DEFAULT: '#4A6741', bright: '#6B8E5F' },
        cream: '#FDFCF8',
        'earth-dark': '#3D3B35',
        'green-border': '#C5D4BC',
        'dark-earth': '#1A1E18',
        'dark-earth-lighter': '#252B23',
        'dim-green': '#3D4A3D',
        'light-cream': '#E8E6DD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
