/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // VantageQuest brand palette (used lightly)
        deepBlue: "#2B6CB0",
        coral: "#E53E3E",
        sky: "#63B3ED",
        navy: "#2C5282",
        bgGray: "#F7FAFC"
      }
    }
  },
  plugins: []
};
