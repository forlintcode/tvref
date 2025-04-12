/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          background: "#0b0c10",
          card: "#1f2833",
          accent: "#66fcf1",
          heading: "#c5c6c7",
          primary: "#45a29e",
          danger: "#ff2e63",
        },
        fontFamily: {
          sans: ["'Segoe UI'", "Roboto", "sans-serif"],
        },
        boxShadow: {
          soft: "0 4px 20px rgba(0, 0, 0, 0.4)",
        },
      },
    },
    plugins: [],
  };
  