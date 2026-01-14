/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shalom: {
          gray: '#374151',      // Gris oscuro profesional
          lightGray: '#F3F4F6', // Gris claro para fondos
          red: '#DC2626',       // Rojo para acciones y marca
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
