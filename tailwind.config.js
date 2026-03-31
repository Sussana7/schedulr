/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "scholar-card": "rgba(16, 45, 33, 0.5)",
        "scholar-accent": "#f4b461",
      },
    },
  },
  plugins: [],
};
