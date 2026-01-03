/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bank-blue': '#004B91',
      },
      backgroundColor: {
        'app-bg': '#F8FAFC',
      },
    },
  },
  plugins: [],
}

