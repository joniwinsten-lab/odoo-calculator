/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // jos haluat takaisin 3xl:n, voit lisätä sen tänne:
      // borderRadius: { '3xl': '1.5rem' },
    },
  },
  plugins: [],
};
