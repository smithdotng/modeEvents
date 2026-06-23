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
        bg: '#0f0f1a',
        surface: '#1a1a2e',
        surface2: '#242438',
        border: '#2e2e4a',
        primary: '#6c63ff',
        'primary-dark': '#574fd6',
        secondary: '#03d6c0',
        soft: '#9090b0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
