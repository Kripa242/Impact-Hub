/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#00C37F',
          dark: '#0A1628',
          card: '#111D35',
          border: '#1E2E4A',
          muted: '#4A6080',
          light: '#A8C4E0',
        }
      }
    },
  },
  plugins: [],
}
