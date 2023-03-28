/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'tablet': '640px',
      // => @media (min-width: 640px) { ... }

      'laptop': '1024px',
      // => @media (min-width: 1024px) { ... }

      'desktop': '1280px',
      // => @media (min-width: 1280px) { ... }
    },
    extend: {
      fontFamily: {
        titleFont: ['Epilogue'],
        bodyfont: ['Inter']

      },
      colors: {
        'eggshell': '#F7F4E3',
        'darkgreen': '#69B880',
        'green': '#76B989',
        'lightgreen': '#99dead',
        'gray': '#40413F',
      },
      fontWeight: {
        'black': '900',
        'bold': '700',
        'medium': '500',

      }
    }
  },

  plugins: [],
}
