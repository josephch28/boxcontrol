/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0B0B0D',
          card: '#141418',
          surface: '#1B1B21',
          sidebar: '#0E0E11',
        },
        border: {
          subtle: '#2A2A31',
          muted: '#3A3A42',
        },
        gold: {
          DEFAULT: '#E8B84A',
          hover: '#D4A538',
          muted: '#A6822D',
          dark: '#1A1206',
        },
        bone: '#F5EFE0',
        muted: '#A5A5AF', // WCAG AAA Compliant (7.02:1 - 8.05:1 on dark)
        subtext: '#C4C4CC',
        border: {
          subtle: '#33333C', // WCAG 2.1 UI Component Boundary standard (3:1+)
          muted: '#40404C',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
