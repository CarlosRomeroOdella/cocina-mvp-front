/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Paleta oficial Odella (https://odellaglobal.com.mx/brandsite/)
        // brand-500 = Bright Blue oficial, brand-900 = Navy (PANTONE 282C) oficial
        brand: {
          50:  "#eef4fe",
          100: "#c0dafd",
          200: "#92c0fc",
          300: "#64a6fb",
          400: "#368cfa",
          500: "#0874f7",
          600: "#075fca",
          700: "#06499d",
          800: "#05346f",
          900: "#041e42",
        },
      },
    },
  },
  plugins: [],
};
