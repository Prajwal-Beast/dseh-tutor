/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        economics: {
          DEFAULT: '#3b82f6',
          light: '#eff6ff',
          dark: '#1d4ed8',
        },
        statistics: {
          DEFAULT: '#22c55e',
          light: '#f0fdf4',
          dark: '#15803d',
        },
        mathematics: {
          DEFAULT: '#a855f7',
          light: '#faf5ff',
          dark: '#7e22ce',
        },
        cs: {
          DEFAULT: '#f97316',
          light: '#fff7ed',
          dark: '#c2410c',
        },
      },
    },
  },
  plugins: [],
};
