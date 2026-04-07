/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0a0e27', 800: '#111640', 700: '#1a1f55', 600: '#232a6a' },
        aero: { blue: '#3b82f6', cyan: '#22d3ee', green: '#10b981' },
      },
    },
  },
  plugins: [],
}
