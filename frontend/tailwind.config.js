/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        primary: '#00E5FF',
        secondary: '#FFB800',
        accent: '#00FF88',
        card: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        glass: '30px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(0,229,255,0.25)',
        'glow-accent': '0 0 40px rgba(0,255,136,0.25)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
