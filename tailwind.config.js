/** @type {import('tailwindcss').Config} */
export default {
  content: [
  "./index.html",
  "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      lineHeight: {
      'relaxed': '1.75',
      },
      letterSpacing: {
      'wide': '0.025em',
      }
    },
  },
  plugins: [],
}

