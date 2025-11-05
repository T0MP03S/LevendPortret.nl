/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#191970",
        coral: "#ff546b",
        turquoise: "#00ced1",
      },
      fontFamily: {
        heading: ['"bree"', 'sans-serif'],
        subheading: ['"Montserrat"', 'sans-serif'],
        body: ['"Montserrat"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
