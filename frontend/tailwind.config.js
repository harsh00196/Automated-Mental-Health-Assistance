/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5a8bf1",
        secondary: "#A0C4FF",
        accent: "#CAFFBF",
        background: "#f4f7fe",
        darkBackground: "#1A1B26",
        whiteCard: "#ffffff",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
