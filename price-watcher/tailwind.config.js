/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Amazon-inspired palette
        ink: '#0f1111', // near-black header text
        cream: '#f9fafb', // light page background
        ember: '#ff9900', // Amazon orange
        pacific: '#146eb4', // Amazon blue
      },
    },
  },
  plugins: [],
}
