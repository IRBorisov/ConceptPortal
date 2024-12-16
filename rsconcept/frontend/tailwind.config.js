/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      app: {
        0: 'var(--clr-app-0)',
        100: 'var(--clr-app-100)',
        200: 'var(--clr-app-200)',
        300: 'var(--clr-app-300)',
        400: 'var(--clr-app-400)',
        600: 'var(--clr-app-600)',
        800: 'var(--clr-app-800)',
        999: 'var(--clr-app-999)'
      },
      prim: {
        100: 'var(--clr-prim-100)',
        200: 'var(--clr-prim-200)',
        300: 'var(--clr-prim-300)',
        400: 'var(--clr-prim-400)',
        600: 'var(--clr-prim-600)',
        800: 'var(--clr-prim-800)',
        999: 'var(--clr-prim-999)'
      },
      warn: {
        100: 'var(--clr-warn-100)',
        600: 'var(--clr-warn-600)'
      },
      ok: {
        600: 'var(--clr-ok-600)'
      }
    },
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
