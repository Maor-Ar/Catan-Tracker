/**
 * NOTE: Tailwind v4 is configured via CSS (@theme in src/index.css),
 * not via this file. This file is kept as a reference for the palette
 * used in the design — Tailwind itself ignores it in v4.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        catanOrange: "#f39c12",
        catanRed: "#e74c3c",
        catanBlue: "#2980b9",
        catanGreen: "#2ecc71",
        catanYellow: "#f1c40f",
        catanTan: "#f3e5ab",
      },
    },
  },
  plugins: [],
};
