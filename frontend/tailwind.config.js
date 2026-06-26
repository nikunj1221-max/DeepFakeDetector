/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        bg:        '#100d09',
        surface:   '#231d18',
        surface2:  '#1f1813',
        border:    '#d4af37',
        accent:    '#7d1320',
        real:      '#22c55e',
        fake:      '#be123c',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'scan':    'scan 2s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        pulseRing: {
          '0%, 100%': { borderColor: '#1E2D44' },
          '50%':      { borderColor: '#2563EB88' },
        },
      },
    },
  },
  plugins: [],
}
