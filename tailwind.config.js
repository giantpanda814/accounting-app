module.exports = {
  theme: {
    fontFamily: {
      sans: ['Inter var experimental', 'sans-serif']
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      lg: '14px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '28px'
    },
    extend: {
      maxHeight: {
        '64': '16rem'
      },
      minWidth: {
        '40': '10rem',
        '56': '14rem',
        '56': '14rem'
      },
      maxWidth: {
        '32': '8rem',
        '56': '14rem'
      },
      spacing: {
        '7': '1.75rem',
        '14': '3.5rem',
        '72': '18rem',
        '80': '20rem'
      },
      boxShadow: {
        'outline-px': '0 0 0 1px rgba(66, 153, 225, 0.5)',
        default: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        md: '0 0 2px 0 rgba(0, 0, 0, 0.10), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        button: '0 0.5px 0 0 rgba(0, 0, 0, 0.08)'
      },
      borderRadius: {
        '5px': '5px',
        '6px': '6px',
        '12px': '12px'
      },
      colors: {
        black: '#112B42',
        gray: {
          '100': '#f4f4f6',
          '200': '#e9ebed',
          '300': '#dfe1e2',
          '400': '#cccfd1',
          '500': '#b7bfc6',
          '600': '#a1abb4',
          '700': '#9fa5a8',
          '800': '#7f878a',
          '900': '#415668'
        }
      }
    }
  },
  variants: {
    margin: ['responsive', 'first', 'hover', 'focus'],
    backgroundColor: ['responsive', 'first', 'hover', 'focus', 'focus-within']
  },
  plugins: []
};
