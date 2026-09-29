/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        healthcare: {
          navy: '#0f2942',
          blue: '#1e40af',
          teal: '#0d9488',
          lightTeal: '#f0fdfa',
          slate: '#f8fafc',
          charcoal: '#0f172a',
          muted: '#64748b',
          border: '#e2e8f0',
        },
        medical: {
          blue: '#0369a1',
          teal: '#0d9488',
          amber: '#b45309',
          red: '#b91c1c',
          green: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
