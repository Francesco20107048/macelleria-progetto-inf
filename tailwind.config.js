/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          DEFAULT: 'rgb(var(--bordeaux) / <alpha-value>)',
          dark: 'rgb(74 10 18 / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(201 168 76 / <alpha-value>)',
          light: 'rgb(232 201 122 / <alpha-value>)',
        },
        cream: '#F5F5F0',
        edge: '#E0DDD5',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
