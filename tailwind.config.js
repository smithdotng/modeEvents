/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#dddcd7',
        surface: '#f2f1eb',
        surface2: '#e8e7e1',
        border: '#c0bfb9',
        primary: '#2a3b19',
        'primary-dark': '#1e2d12',
        secondary: '#7ab648',
        soft: '#546048',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
