/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#AD4A85',
          soft: '#C57BA3',
          deep: '#8E3466',
        },
        rose: {
          light: '#EFD7E3',
          DEFAULT: '#DFAFC7',
          blush: '#F6E8EF',
        },
        surface: {
          DEFAULT: '#FAF8F8',
          muted: '#F7F0F3',
        },
        ink: {
          DEFAULT: '#2A1A22',
          muted: '#7A5A6A',
        },
        footer: '#1F1419',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        subheading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Manrope', 'sans-serif'],
        button: ['Inter', 'sans-serif'],
        label: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(173, 74, 133, 0.12)',
        card: '0 12px 40px rgba(173, 74, 133, 0.1)',
        lift: '0 18px 50px rgba(139, 58, 106, 0.16)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatBloom: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(6deg)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        floatBloom: 'floatBloom 3.6s ease-in-out infinite',
        softPulse: 'softPulse 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}
