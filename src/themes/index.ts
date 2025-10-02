export { colors } from './colors'

// Theme configuration
export const theme = {
  colors: {
    primary: {
      main: '#667eea',
      light: '#8a9ef0',
      dark: '#4c63d2',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a6bb8',
      dark: '#5a3780',
    },
    background: {
      main: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      card: 'rgba(255, 255, 255, 0.95)',
      overlay: 'rgba(0, 0, 0, 0.1)',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      white: '#ffffff',
      dark: '#2c3e50',
    },
    border: {
      light: '#e0e0e0',
      medium: '#bdbdbd',
      dark: '#757575',
    },
    status: {
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
      info: '#3498db',
    },
    shadow: {
      light: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
      heavy: '0 8px 16px rgba(0, 0, 0, 0.2)',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
      xxxl: '2rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
}
