/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        codex: {
          primary: '#1E40AF',
          secondary: '#1D4ED8',
          surface: '#F8FAFC',
          accent: '#EFF6FF'
        }
      }
    },
  },
  plugins: [],
}

