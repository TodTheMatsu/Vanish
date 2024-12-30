/** @type {import('tailwindcss').Config} */
import reactglow from '@codaworks/react-glow'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [ require('@codaworks/react-glow/tailwind')],
}