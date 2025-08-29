/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 75%, #f5576c 100%)',
        'gradient-panel': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-message': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'typing': 'typing 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '30%': { transform: 'translateY(-10px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
