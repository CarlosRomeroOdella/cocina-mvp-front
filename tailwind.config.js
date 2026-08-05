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
        // Version desaturada/suave para que sea comoda a la vista;
        // brand-900 se deja en el Navy oficial exacto como ancla de marca.
        brand: {
          50:  "#f0f2f6",
          100: "#c0d4ec",
          200: "#90b4e1",
          300: "#6196d6",
          400: "#3077cc",
          500: "#2a65ae",
          600: "#235490",
          700: "#1c4272",
          800: "#153154",
          900: "#041e42",
        },
        // Purple secundario oficial (desaturado), para diferenciarse del azul/navy primario
        accent: {
          50:  "#f0f0fa",
          100: "#d1d3e7",
          200: "#b3b7d6",
          300: "#9399c6",
          400: "#757db6",
          500: "#555fa5",
          600: "#474f8a",
          700: "#39406f",
          800: "#2b2f54",
          900: "#181c40",
        },
      },
    },
  },
  plugins: [],
};
