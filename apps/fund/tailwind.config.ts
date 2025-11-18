import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
        heading: ['"Bree"', 'sans-serif'],
        subheading: ['"Montserrat"', 'sans-serif'],
        body: ['"Bree"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
