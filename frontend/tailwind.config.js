/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for better mobile experience
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1440px',
      },
      colors: {
        primary: {
          50: '#fef2f8',
          100: '#fde6f1',
          200: '#fccce3',
          300: '#faa3cd',
          400: '#f770b0',
          500: '#de3673',
          600: '#c92a5f',
          700: '#a8214d',
          800: '#8b1e41',
          900: '#731d38',
        },
        secondary: {
          50: '#f0f2fd',
          100: '#e1e5fb',
          200: '#c3cbf7',
          300: '#a5b1f3',
          400: '#8797ef',
          500: '#5c67b6',
          600: '#4a5292',
          700: '#383e6e',
          800: '#262a4a',
          900: '#141626',
        },
        accent: {
          50: '#f8f9fe',
          100: '#f1f3fd',
          200: '#e3e7fb',
          300: '#d5dbf9',
          400: '#c7cff7',
          500: '#edf0fd',
          600: '#bebef5',
          700: '#8f8feb',
          800: '#6060e1',
          900: '#3131d7',
        }
      },
      fontFamily: {
        sans: ['Blinker', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [],
}
