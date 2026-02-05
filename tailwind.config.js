/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        // "Void & Neon" Palette Overrides
        // We override the default colors to instantly theming the entire app
        slate: {
          50: '#f0f3ff', // Very light blue-grey
          100: '#e0e6ff',
          200: '#c2caff',
          300: '#94a1ff',
          400: '#606eff',
          500: '#3d4aff', // Vibrant purple-blue anchor
          600: '#2529cc',
          700: '#1e20ab',
          800: '#141559', // Deep navy
          900: '#0c0d35', // Midnight
          950: '#06071a', // Void
        },
        // Mapping "slate" in the code to a new custom "Ink/Gunmetal" palette
        // because the previous override was too blue. 
        // Let's stick to a rich, cool neutral for UI backgrounds.
        slate: {
          50: '#F5F7FA',
          100: '#EBEFF5',
          200: '#DDE4ED',
          300: '#C2CDE0',
          400: '#97A8C2',
          500: '#6E819E',
          600: '#4C5D76',
          700: '#354157',
          800: '#222B3D', // Card BG
          900: '#151B29', // App BG
          950: '#0B0F19', // Darkest
        },
        // Electric Blue/Indigo
        blue: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo-500
          600: '#4f46e5', // Indigo-600 (Primary Action)
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Neon Rose/Red
        red: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Rose-500
          600: '#e11d48', // Rose-600
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Cyber Gold
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Amber-500
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-glow': 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
