/**** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        muted: '#6b7280',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'md': '0 4px 6px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
}
