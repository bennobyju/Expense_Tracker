/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',    // Slate-50 Canvas Surface
        primary: '#2563EB',   // Blue-600 Primary Action[cite: 4]
        income: '#16A34A',    // Green Income Value[cite: 4]
        expense: '#DC2626',   // Rose-600 Expense Value[cite: 4]
      }
    },
  },
  plugins: [],
}