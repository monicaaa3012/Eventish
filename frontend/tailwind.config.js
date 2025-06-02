/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        softTeal: '#5B8D87',
        aquaMist: '#C5E2E0',
        skyWash: '#EAF6F5',
        forestGreen: '#2F4F4F',
        leafGreen: '#8FAF9F',
        mutedNavy: '#3A5A5A',
      },
    },
  },
  plugins: [],
};
