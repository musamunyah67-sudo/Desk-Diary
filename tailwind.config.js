/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1547e7',
        gold: '#ffaf59',
        'dark-gray': '#a89bba',
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        sans: ['Open Sans', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
