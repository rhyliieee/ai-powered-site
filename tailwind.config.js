/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'brand-deep-plum': '#211A1D',
        'brand-electric-purple': '#6320EE',
        'brand-soft-purple': '#8075FF',
        'brand-lavender-mist': '#F8F0FB',
        light: {
          background: '#F8F0FB',
          'background-alt': '#F3E8F7',
          surface: '#FFFFFF',
          'surface-elevated': '#FEFCFF',
          primary: '#6320EE',
          'primary-hover': '#8075FF',
          secondary: '#8075FF',
          'secondary-hover': '#6320EE',
          tertiary: '#B8A9FF',
          text: '#2A1F2E',
          'text-secondary': '#4A3B52',
          'text-muted': '#6B5B73',
          border: '#E8D9F0',
          'border-soft': '#F0E6F5'
        },
        dark: {
          background: '#211A1D',
          'background-alt': '#2D1F24',
          surface: '#342831',
          'surface-elevated': '#3F313A',
          primary: '#8075FF',
          'primary-hover': '#6320EE',
          secondary: '#6320EE',
          'secondary-hover': '#8075FF',
          tertiary: '#A691FF',
          text: '#F8F0FB',
          'text-secondary': '#D4C4E0',
          'text-muted': '#B8A4C8',
          border: '#4A3B52',
          'border-soft': '#3D2F42'
        },
        background: {
          DEFAULT: 'var(--color-bg)',
          alt: 'var(--color-bg-alt)'
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)'
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)'
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)'
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)'
        },
        border: {
          DEFAULT: 'var(--color-border)',
          soft: 'var(--color-border-soft)'
        }
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        actor: ['Actor', 'sans-serif']
      },
      boxShadow: {
        'light-sm': '0 1px 2px 0 rgba(42, 31, 46, 0.05)',
        'light-md': '0 4px 6px -1px rgba(42, 31, 46, 0.1), 0 2px 4px -1px rgba(42, 31, 46, 0.06)',
        'light-lg': '0 10px 15px -3px rgba(42, 31, 46, 0.1), 0 4px 6px -2px rgba(42, 31, 46, 0.05)',
        'light-xl': '0 20px 25px -5px rgba(42, 31, 46, 0.1), 0 10px 10px -5px rgba(42, 31, 46, 0.04)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(99, 32, 238, 0.1)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(99, 32, 238, 0.1)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(128, 117, 255, 0.1)',
        'glow-purple': '0 0 20px rgba(99, 32, 238, 0.4)',
        'glow-soft': '0 0 10px rgba(128, 117, 255, 0.3)',
        'glow-intense': '0 0 30px rgba(128, 117, 255, 0.5)'
      },
      backgroundImage: {
        'gradient-light-primary': 'linear-gradient(135deg, #F8F0FB 0%, #F3E8F7 100%)',
        'gradient-light-surface': 'linear-gradient(135deg, #FFFFFF 0%, #FEFCFF 100%)',
        'gradient-light-accent': 'linear-gradient(135deg, #6320EE 0%, #8075FF 100%)',
        'gradient-dark-primary': 'linear-gradient(135deg, #211A1D 0%, #2D1F24 100%)',
        'gradient-dark-surface': 'linear-gradient(135deg, #342831 0%, #3F313A 100%)',
        'gradient-dark-accent': 'linear-gradient(135deg, #8075FF 0%, #6320EE 100%)',
        'hero-light': 'radial-gradient(ellipse at top, #F3E8F7 0%, #F8F0FB 70%, #E8D1F0 100%)',
        'hero-dark': 'radial-gradient(ellipse at top, #342831 0%, #211A1D 70%, #1A141A 100%)',
        'purple-burst': 'radial-gradient(circle, #8075FF 0%, #6320EE 50%, #211A1D 100%)',
        'lavender-fade': 'linear-gradient(180deg, #F8F0FB 0%, transparent 100%)'
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    // Add CSS variables for theme colors
    function({ addBase, theme }) {
      addBase({
        ':root': {
          '--color-bg': theme('colors.light.background'),
          '--color-bg-alt': theme('colors.light.background-alt'),
          '--color-surface': theme('colors.light.surface'),
          '--color-surface-elevated': theme('colors.light.surface-elevated'),
          '--color-primary': theme('colors.light.primary'),
          '--color-primary-hover': theme('colors.light.primary-hover'),
          '--color-secondary': theme('colors.light.secondary'),
          '--color-secondary-hover': theme('colors.light.secondary-hover'),
          '--color-tertiary': theme('colors.light.tertiary'),
          '--color-text': theme('colors.light.text'),
          '--color-text-secondary': theme('colors.light.text-secondary'),
          '--color-text-muted': theme('colors.light.text-muted'),
          '--color-border': theme('colors.light.border'),
          '--color-border-soft': theme('colors.light.border-soft'),
          '--radius': '0.5rem'
        },
        '.dark': {
          '--color-bg': theme('colors.dark.background'),
          '--color-bg-alt': theme('colors.dark.background-alt'),
          '--color-surface': theme('colors.dark.surface'),
          '--color-surface-elevated': theme('colors.dark.surface-elevated'),
          '--color-primary': theme('colors.dark.primary'),
          '--color-primary-hover': theme('colors.dark.primary-hover'),
          '--color-secondary': theme('colors.dark.secondary'),
          '--color-secondary-hover': theme('colors.dark.secondary-hover'),
          '--color-tertiary': theme('colors.dark.tertiary'),
          '--color-text': theme('colors.dark.text'),
          '--color-text-secondary': theme('colors.dark.text-secondary'),
          '--color-text-muted': theme('colors.dark.text-muted'),
          '--color-border': theme('colors.dark.border'),
          '--color-border-soft': theme('colors.dark.border-soft')
        }
      });
    }
  ]
};

export default config;