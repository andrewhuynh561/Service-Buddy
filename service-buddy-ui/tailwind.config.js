/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        // Light mode gradients (current)
        'gradient-main': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 75%, #f5576c 100%)',
        'gradient-panel': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-message': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        
        // Dark mode gradients - centered "sun" effect
        'gradient-main-dark': 'radial-gradient(circle at 50% 70%, #ea580c 0%, #dc2626 12%, #be185d 25%, #7c3aed 45%, #4338ca 65%, #1e293b 85%, #0f172a 100%)',
        'gradient-panel-dark': 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
        'gradient-message-dark': 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
        'gradient-header-dark': 'linear-gradient(135deg, #581c87 0%, #be185d 50%, #dc2626 100%)',
        'gradient-send-dark': 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
        'gradient-chat-dark': 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
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
