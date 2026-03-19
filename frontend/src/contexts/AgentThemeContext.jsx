import React, { createContext, useContext } from 'react';

/**
 * AgentThemeContext - Modern design system for the Mentra Agent
 * Provides a cohesive design language with:
 * - Semantic color palette
 * - Typographic scale
 * - Spacing system
 * - Component variants
 */

const AgentThemeContext = createContext();

export const agentTheme = {
  // ───────────────────────────────────────────────────────────────
  // Color Palette (Semantic)
  // ───────────────────────────────────────────────────────────────
  colors: {
    // Primary - Deep indigo for brand
    primary: {
      50: '#f0f4ff',
      100: '#e0e9ff',
      200: '#c7d5ff',
      300: '#a3b8ff',
      400: '#7c8aff',
      500: '#5865f2', // main
      600: '#4752c4',
      700: '#3d4696',
      800: '#2d3468',
      900: '#1a1f3a',
    },

    // Accent - Vibrant teal
    accent: {
      50: '#f0fdfb',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // main
      600: '#0d9488',
      700: '#0f766e',
      800: '#134e4a',
      900: '#0d3a36',
    },

    // Success - Green
    success: {
      50: '#f0fdf4',
      100: '#dbeafe',
      200: '#86efac',
      300: '#4ade80',
      400: '#22c55e',
      500: '#16a34a', // main
      600: '#15803d',
      700: '#166534',
      800: '#1a5c3a',
    },

    // Warning - Amber
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // main
      600: '#d97706',
      700: '#b45309',
    },

    // Error - Red
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // main
      600: '#dc2626',
      700: '#b91c1c',
    },

    // Neutral - Grays
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      150: '#efefef',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },

  // ───────────────────────────────────────────────────────────────
  // Typography Scale
  // ───────────────────────────────────────────────────────────────
  typography: {
    // Font families
    fontFamily: {
      display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Fira Code', 'Monaco', monospace",
    },

    // Font weights
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Type scales
    scales: {
      // Display - for major headings
      display: {
        lg: {
          fontSize: '3.75rem', // 60px
          lineHeight: '1.2',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        },
        md: {
          fontSize: '3rem', // 48px
          lineHeight: '1.2',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        sm: {
          fontSize: '2.25rem', // 36px
          lineHeight: '1.3',
          fontWeight: 700,
          letterSpacing: '-0.005em',
        },
      },

      // Heading - for section titles
      heading: {
        lg: {
          fontSize: '1.875rem', // 30px
          lineHeight: '1.3',
          fontWeight: 600,
          letterSpacing: '-0.005em',
        },
        md: {
          fontSize: '1.5rem', // 24px
          lineHeight: '1.35',
          fontWeight: 600,
          letterSpacing: '0em',
        },
        sm: {
          fontSize: '1.25rem', // 20px
          lineHeight: '1.4',
          fontWeight: 600,
          letterSpacing: '0em',
        },
        xs: {
          fontSize: '1.125rem', // 18px
          lineHeight: '1.4',
          fontWeight: 600,
          letterSpacing: '0em',
        },
      },

      // Body - for main content
      body: {
        lg: {
          fontSize: '1.125rem', // 18px
          lineHeight: '1.6',
          fontWeight: 400,
          letterSpacing: '0em',
        },
        md: {
          fontSize: '1rem', // 16px
          lineHeight: '1.6',
          fontWeight: 400,
          letterSpacing: '0em',
        },
        sm: {
          fontSize: '0.875rem', // 14px
          lineHeight: '1.5',
          fontWeight: 400,
          letterSpacing: '0em',
        },
        xs: {
          fontSize: '0.75rem', // 12px
          lineHeight: '1.5',
          fontWeight: 400,
          letterSpacing: '0em',
        },
      },

      // Caption - for labels and small text
      caption: {
        md: {
          fontSize: '0.875rem', // 14px
          lineHeight: '1.4',
          fontWeight: 500,
          letterSpacing: '0.005em',
        },
        sm: {
          fontSize: '0.75rem', // 12px
          lineHeight: '1.4',
          fontWeight: 500,
          letterSpacing: '0.01em',
        },
      },
    },
  },

  // ───────────────────────────────────────────────────────────────
  // Spacing System (8px base)
  // ───────────────────────────────────────────────────────────────
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem', // 48px
    '4xl': '4rem', // 64px
  },

  // ───────────────────────────────────────────────────────────────
  // Border Radius
  // ───────────────────────────────────────────────────────────────
  borderRadius: {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // ───────────────────────────────────────────────────────────────
  // Shadows
  // ───────────────────────────────────────────────────────────────
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.12)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
  },

  // ───────────────────────────────────────────────────────────────
  // Transitions
  // ───────────────────────────────────────────────────────────────
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ───────────────────────────────────────────────────────────────
  // Z-Index Scale
  // ───────────────────────────────────────────────────────────────
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

export const AgentThemeProvider = ({ children }) => {
  return (
    <AgentThemeContext.Provider value={agentTheme}>
      {children}
    </AgentThemeContext.Provider>
  );
};

export const useAgentTheme = () => {
  const context = useContext(AgentThemeContext);
  if (!context) {
    return agentTheme;
  }
  return context;
};
