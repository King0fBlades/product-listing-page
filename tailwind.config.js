/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    relative: true,
    files: [
      './src/**/*.{html,js}',
      './pages/**/*.{html,js}',
      './index.html'
  ]},
  variants: {
    fill: ['hover', 'focus'],
  },
  theme: {
    extend: {},
  },
  plugins: [],
}

