/**
 * Application Colors
 * 
 * This is the ONLY place to define colors for the entire application.
 * Change these values to instantly update the app's color scheme.
 */

export const colors = {
  // Brand Colors
  primary: '#effcaa',     // Light greenish yellow
  secondary: '#1d2e28',   // Dark green
  tertiary: '#FFFFFF',    // Dark green (same as secondary for now)
  accent: '#94bc20',      // Bright lime green
  
  // Background Colors
  bgMain: '#1d2e28',      // Near black
  bgActionCard: '#0b3a29',
  bgNavbar: '#0b3a29',
  bgCard: '#f8fdd9',      // White
  bgDark: '#282828',      // Dark gray
  bgForm: '#0f0f0f',      // Slightly lighter than secondary for form backgrounds
  
  // Border Colors
  borderAccent: '#94bc20', // Slightly darker accent color for borders
  
  // Effect Colors
  radialBlur: {
    primary: 'rgba(239, 252, 170, 0.35)',  // primary with opacity
    accent: 'rgba(177, 224, 44, 0.4)',     // accent with opacity
    secondary: 'rgba(11, 58, 41, 0.5)',    // secondary with opacity
  },
  
  // Text Colors
  textPrimary: '#effcaa', // White
  textSecondary: '#0b3a29',
  textTertiary: '#1d2e28', // Light gray
  textLight: '#effcaa',   // Black (for light backgrounds)
  
  // Status Colors
  success: '#2ecc71',     // Green
  warning: '#f39c12',     // Orange
  error: '#e74c3c',       // Red
  info: '#3498db',        // Blue
  
  // Shadow Colors
  shadowAccent:  'rgba(201, 255, 50, 0.7)',
  
  // Gray Scale
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Black/White
  black: '#000000',
  white: '#ffffff',

  // Node Type Colors (brand-aligned)
  node: {
    // Problem - uses error/warning tones (needs attention)
    problem: {
      border: '#e74c3c',
      bg: 'rgba(231, 76, 60, 0.15)',
      text: '#e74c3c',
    },
    // Objective - uses accent (goal-oriented, prominent)
    objective: {
      border: '#94bc20',
      bg: 'rgba(148, 188, 32, 0.15)',
      text: '#94bc20',
    },
    // Key Result - uses primary (measurable outcomes)
    keyresult: {
      border: '#7fa31a',
      bg: 'rgba(127, 163, 26, 0.15)',
      text: '#7fa31a',
    },
    // Metric - uses info blue (data-driven)
    metric: {
      border: '#3498db',
      bg: 'rgba(52, 152, 219, 0.15)',
      text: '#3498db',
    },
    // Doc - neutral/muted (content container)
    doc: {
      border: '#6b7280',
      bg: 'rgba(107, 114, 128, 0.1)',
      text: '#6b7280',
    },
    // Agent - uses accent variant (AI-powered)
    agent: {
      border: '#94bc20',
      bg: 'rgba(148, 188, 32, 0.15)',
      text: '#94bc20',
    },
    // API - uses secondary green
    api: {
      border: '#0b3a29',
      bg: 'rgba(11, 58, 41, 0.15)',
      text: '#0b3a29',
    },
    // Webhook - uses warning orange
    webhook: {
      border: '#f39c12',
      bg: 'rgba(243, 156, 18, 0.15)',
      text: '#f39c12',
    },
    // MCP - uses primary light
    mcp: {
      border: '#effcaa',
      bg: 'rgba(239, 252, 170, 0.15)',
      text: '#c9e866',
    },
    // Integration - uses secondary variant
    integration: {
      border: '#1d4d3a',
      bg: 'rgba(29, 77, 58, 0.15)',
      text: '#1d4d3a',
    },
    // Custom - neutral
    custom: {
      border: '#9ca3af',
      bg: 'rgba(156, 163, 175, 0.1)',
      text: '#9ca3af',
    },
  },
} 