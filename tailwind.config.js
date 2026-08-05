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
        // Basada en las variables reales de https://odellaglobal.com/
        // (--odella-azul:#041E42, --odella-gris-bg:#f5f5f5, hover:#08316B).
        // Sin azul vivo ni morado: solo navy + gris, como el sitio oficial.
        brand: {
          50:  "#f5f5f5",
          100: "#ced4de",
          200: "#a6b4c7",
          300: "#7f93b0",
          400: "#577299",
          500: "#305282",
          600: "#08316b",
          700: "#072b5d",
          800: "#052450",
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
