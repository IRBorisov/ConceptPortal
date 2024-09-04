/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    zIndex: {
      bottom: '0',
      topmost: '99',
      pop: '10',
      sticky: '20',
      tooltip: '30',
      navigation: '50',
      modal: '60',
      modalControls: '70',
      modalTooltip: '90'
    },
    screens: {
      xs: '475px',
      ...defaultTheme.screens
    },
    extend: {}
  },
  plugins: [],
  ...(process.env.NODE_ENV === 'production'
    ? {
        experimental: {
          optimizeUniversalDefaults: true
        }
      }
    : {})
};
