/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        galaxy: {
          dark: "#020617",
          soft: "rgba(15,23,42,0.6)",
        },
      },
    },
  },

  plugins: [],
};
