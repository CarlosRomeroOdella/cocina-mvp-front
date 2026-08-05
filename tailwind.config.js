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
        // brand-400 = Bright Blue oficial (acentos/hover claros)
        // brand-900 = Navy PANTONE 282C oficial (los tonos 500-900 son azules
        // oscuros a propósito: son los que se usan en botones/bordes solidos)
        brand: {
          50:  "#eef2f8",
          100: "#b5d3f8",
          200: "#7bb3f8",
          300: "#4294f7",
          400: "#0874f7",
          500: "#0763d3",
          600: "#0652af",
          700: "#06408a",
          800: "#052f66",
          900: "#041e42",
        },
        // Purple secundario oficial, para diferenciarse del azul/navy primario
        accent: {
          50:  "#f0f0fa",
          100: "#ced1ed",
          200: "#adb3e0",
          300: "#8b94d4",
          400: "#6a76c7",
          500: "#4857ba",
          600: "#3c489c",
          700: "#303a7d",
          800: "#242b5f",
          900: "#181c40",
        },
      },
    },
  },
  plugins: [],
};
