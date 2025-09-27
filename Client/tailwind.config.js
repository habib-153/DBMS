const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        exo: ["var(--font-exo)"],
      },
      colors: {
        brand: {
          primary: "#0070f3",
          secondary: "#7928ca",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
