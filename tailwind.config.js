/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080A0F',
        surface: '#0D1117',
        surface2: '#161B24',
        accent: '#00D4FF',
        accent2: '#7B61FF',
        accent3: '#FF6B6B',
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
