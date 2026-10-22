/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            DEFAULT: '#f76806',
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f76806',
            600: '#ea580c',
            700: '#c2410c',
          },
          blue: {
            DEFAULT: '#0041c2',
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#0041c2',
            600: '#0035a0',
            700: '#00297d',
          },
          green: {
            DEFAULT: '#0b6623',
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#0b6623',
            600: '#08521c',
            700: '#063f15',
          },
        },
      },
      fontFamily: {
        bubblegum: ['"Bubblegum Sans"', 'cursive', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft-orange': '0 10px 30px -10px rgba(247, 104, 6, 0.25)',
        'soft-blue': '0 10px 30px -10px rgba(0, 65, 194, 0.25)',
        'soft-green': '0 10px 30px -10px rgba(11, 102, 35, 0.25)',
      },
    },
  },
  plugins: [],
};
