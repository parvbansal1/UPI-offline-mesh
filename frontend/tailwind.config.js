/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          800: '#161928',
          900: '#0d0f1a',
        },
        brand: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      boxShadow: {
        'glow-brand':  '0 0 20px rgba(99,102,241,0.35)',
        'glow-green':  '0 0 20px rgba(16,185,129,0.35)',
        'glow-red':    '0 0 20px rgba(244,63,94,0.35)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'toast-in':   'toastIn 0.4s cubic-bezier(0.16,1,0.3,1)',
        'spin-slow':  'spin 1.5s linear infinite',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'new-row':    'newRow 2s ease-out',
        'shimmer':    'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        toastIn:    { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        bounceIn:   { from: { opacity: '0', transform: 'scale(0.85)' }, to: { opacity: '1', transform: 'scale(1)' } },
        newRow:     { '0%': { backgroundColor: 'rgba(99,102,241,0.20)' }, '100%': { backgroundColor: 'transparent' } },
        shimmer:    { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-success':  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'shimmer-gradient':  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
