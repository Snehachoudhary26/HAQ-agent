/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0A542E",
          teal: "#037D6F",
          gold: "#D9A21B",
          light: "#F0FDF4",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans'", "'Noto Sans Devanagari'", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.8rem", "1.4"],
        sm: ["0.9rem", "1.5"],
        base: ["1rem", "1.6"],
        lg: ["1.125rem", "1.6"],
        xl: ["1.25rem", "1.5"],
        "2xl": ["1.5rem", "1.4"],
        "3xl": ["1.875rem", "1.3"],
      },
    },
  },
  plugins: [],
};
