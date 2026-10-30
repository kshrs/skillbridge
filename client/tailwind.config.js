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
        dark: {
          950: '#0c0d0f',
          900: '#121417',
          850: '#16191e',
          800: '#1b1e24',
          750: '#21252d',
          700: '#2b303b',
          600: '#3c4250'
        },
        brand: {
          orange: '#d97746',
          yellow: '#f3c46e',
          green: '#9ed68c',
          peach: '#f3a478',
          blue: '#6ca8f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px'
      }
    },
  },
  plugins: [],
}
