/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Metropolis', 'sans-serif'],
        'body': ['Josefin Sans', 'sans-serif'],
      },
      colors: {
        'primary': '#F0F5F9',
        'secondary': '#C9D6DF',
        'tertiary': '#52616B',
        'quaternary': '#1E2022',
        'background': '#F0F5F9'
    },
  },
},
  plugins: [],
}
