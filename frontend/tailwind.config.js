/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["DM Sans",   "system-ui", "sans-serif"],
        serif: ["Fraunces",  "Georgia",   "serif"],
      },
      colors: {
        // Calm and Coffee — identidad global
        cafe: {
          50:  "#FAF6F0",
          100: "#F5EFE0",
          200: "#E8D9B8",
          300: "#D4B896",
          400: "#C47A45",
          500: "#92400e",
          600: "#78350f",
          700: "#5C3D2E",
          800: "#3A2018",
          900: "#1a0800",
        },
        // Cliente — verde musgo
        cliente: {
          50:  "#F0FFF8",
          100: "#DCFCE7",
          200: "#A8E8CC",
          400: "#2EBF7A",
          500: "#1D7A4E",
          600: "#0F4A2E",
          900: "#052E1A",
        },
        // Caficultor — morado tierra
        caficultor: {
          50:  "#FAF5FF",
          100: "#F3EEF5",
          200: "#E0D0E8",
          400: "#9B6FB3",
          500: "#6B3A8A",
          600: "#3D1A5C",
          900: "#1A0A2A",
        },
        // Barista — terracota
        barista: {
          50:  "#FFF7F5",
          100: "#FFF0EB",
          200: "#FFD4C2",
          400: "#F3904B",
          500: "#C0350F",
          600: "#9A2A0C",
          900: "#1a0800",
        },
        // Gerente — azul noche
        gerente: {
          50:  "#F0F6FF",
          100: "#EBF2FF",
          200: "#C2D6F8",
          400: "#5B9BD5",
          500: "#1B4F8A",
          600: "#0F3366",
          900: "#071A33",
        },
        // Catador — dorado ámbar
        catador: {
          50:  "#FFFBF0",
          100: "#FFF8E1",
          200: "#FFE082",
          400: "#D4A847",
          500: "#8A6200",
          600: "#5C4000",
          900: "#2A1C00",
        },
        // Admin — grafito
        admin: {
          50:  "#F8F9FA",
          100: "#E2E8F0",
          400: "#94A3B8",
          500: "#4A5568",
          600: "#2D3748",
          900: "#1A202C",
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft':  '0 2px 15px rgba(0,0,0,0.06)',
        'card':  '0 4px 20px rgba(0,0,0,0.08)',
        'hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}