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
          retro: ["Orbitron", "sans-serif"],
        },
        boxShadow: {
          soft: "0 4px 20px rgba(0, 0, 0, 0.4)",
          neon: "0 0 10px #66fcf1, 0 0 20px #66fcf1, 0 0 30px #45a29e",
        },
        keyframes: {
          tubeFlicker: {
            '0%': { opacity: '0' },
            '5%': { opacity: '1' },
            '10%': { opacity: '0.3' },
            '15%': { opacity: '0.9' },
            '20%': { opacity: '0.4' },
            '25%': { opacity: '1' },
            '30%': { opacity: '0.7' },
            '35%': { opacity: '1' },
            '100%': {
              opacity: '1',
              filter: 'drop-shadow(0 0 2px #66fcf1) drop-shadow(0 0 4px #66fcf1)',
            },
          },
          neonPulse: {
            '0%, 100%': {
              boxShadow: '0 0 10px #66fcf1, 0 0 20px #66fcf1, 0 0 30px #45a29e',
            },
            '50%': {
              boxShadow: '0 0 15px #66fcf1, 0 0 25px #45a29e, 0 0 35px #1f2833',
            },
          },
          glitchFlicker: {
            '0%, 100%': { opacity: '1' },
            '48%': { opacity: '0.8' },
            '49%': { opacity: '0.4' },
            '50%': { opacity: '0.9' },
            '51%': { opacity: '0.6' },
            '52%': { opacity: '1' },
          },
          staticFlash: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0' },
          },
        },
        animation: {
          tubeFlicker: 'tubeFlicker 3s ease-in-out 1',
          neonPulse: 'neonPulse 3s ease-in-out infinite',
          glitchFlicker: 'glitchFlicker 1.5s infinite ease-in-out',
          staticFlash: 'staticFlash 0.3s ease-out 1', // Add static flash animation
        },
      },
    },
    plugins: [],
  };
  