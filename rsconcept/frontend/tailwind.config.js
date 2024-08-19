/** @type {import('tailwindcss').Config} */
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
    extend: {}
  },
  plugins: [],
  experimental: {
    optimizeUniversalDefaults: true
  }
};
