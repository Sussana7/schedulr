/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        scholar: {
          bg: "#04160e",
          surface: "#062016",
          mint: "#a7f3d0",
          gold: "#fbbd71",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  },
  plugins: [],
};
