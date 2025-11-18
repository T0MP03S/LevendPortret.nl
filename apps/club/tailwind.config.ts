import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#191970',
        coral: '#ff546b',
        turquoise: '#00ced1',
      },
      fontFamily: {
        heading: ['"bree"', 'sans-serif'],
        subheading: ['"Montserrat"', 'sans-serif'],
        body: ['"Montserrat"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
