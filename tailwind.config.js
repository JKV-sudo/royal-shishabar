/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-gold': '#d4af37',
        'royal-gold-light': '#f4e4bc',
        'royal-gold-dark': '#b8860b',
        'royal-purple': '#4a148c',
        'royal-purple-light': '#7b1fa2',
        'royal-purple-dark': '#2e0b47',
        'royal-burgundy': '#8b0000',
        'royal-burgundy-light': '#b22222',
        'royal-burgundy-dark': '#5d0000',
        'royal-navy': '#1a237e',
        'royal-navy-light': '#3949ab',
        'royal-navy-dark': '#0d1421',
        'royal-cream': '#fdf6e3',
        'royal-cream-light': '#fff8dc',
        'royal-cream-dark': '#f5e6ca',
        'royal-charcoal': '#2c2c2c',
        'royal-charcoal-light': '#4a4a4a',
        'royal-charcoal-dark': '#1a1a1a',
      },
      fontFamily: {
        'royal': ['Playfair Display', 'serif'],
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #4a148c 0%, #8b0000 50%, #1a237e 100%)',
        'royal-gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #b8860b 100%)',
        'royal-gradient-cream': 'linear-gradient(135deg, #fdf6e3 0%, #fff8dc 50%, #f5e6ca 100%)',
      },
      boxShadow: {
        'royal': '0 0 20px rgba(212, 175, 55, 0.3)',
        'royal-lg': '0 0 30px rgba(212, 175, 55, 0.5)',
        'royal-xl': '0 0 40px rgba(212, 175, 55, 0.6)',
      },
      spacing: {
        'header': '5rem', // 80px to match header height
      },
      animation: {
        'royal-glow': 'royal-glow 3s ease-in-out infinite',
        'royal-pulse': 'royal-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'royal-shimmer': 'royal-shimmer 2s infinite',
        'royal-spin': 'royal-spin 1s linear infinite',
      },
      keyframes: {
        'royal-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        'royal-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'royal-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'royal-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      borderRadius: {
        'royal': '12px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.pt-header': {
          paddingTop: '5rem', // 80px to match header height
        },
        '.mt-header': {
          marginTop: '5rem', // 80px to match header height
        },
        '.top-header': {
          top: '5rem', // 80px to match header height
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
