/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        spider: {
          red: '#E62429',
          darkRed: '#B31317',
          blue: '#0476D0',
          darkBlue: '#024A85',
          black: '#0A0A0C',
          darkGray: '#121216',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(230, 36, 41, 0.8))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(4, 118, 208, 0.9))' },
        },
      },
    },
  },
  plugins: [],
}
