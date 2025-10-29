/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: [
    // Player colors - background
    'bg-player-green',
    'bg-player-red',
    'bg-player-blue',
    'bg-player-purple',
    // Player colors - background with opacity
    'bg-player-green/10',
    'bg-player-green/20',
    'bg-player-green/30',
    'bg-player-red/10',
    'bg-player-red/20',
    'bg-player-red/30',
    'bg-player-blue/10',
    'bg-player-blue/20',
    'bg-player-blue/30',
    'bg-player-purple/10',
    'bg-player-purple/20',
    'bg-player-purple/30',
    // Player colors - border
    'border-player-green',
    'border-player-red',
    'border-player-blue',
    'border-player-purple',
    // Player colors - text
    'text-player-green',
    'text-player-red',
    'text-player-blue',
    'text-player-purple',
  ],
  theme: {
    extend: {
      colors: {
        // Game colors for cards
        'player-green': '#10b981',
        'player-red': '#ef4444',
        'player-blue': '#3b82f6',
        'player-purple': '#a855f7',
        // Background variants for different screens
        'purple-850': '#1e1538',
        'indigo-850': '#1a1f4a',
        'blue-850': '#1a2845',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'card-place': 'cardPlace 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        cardPlace: {
          '0%': { transform: 'scale(1.2) rotate(5deg)', opacity: '0.7' },
          '50%': { transform: 'scale(0.9) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
