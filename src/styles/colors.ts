/**
 * Application Colors - Typequest Brand Guidelines
 *
 * This is the ONLY place to define colors for the entire application.
 * Based on Typequest Brand Guidelines v1.0
 */

export const colors = {
  // Primary Brand Colors (Coral)
  primary: '#ff6b6b',       // Primary brand color, CTAs, highlights
  primaryDark: '#e85555',   // Hover states, emphasis
  primaryLight: '#ff8e8e',  // Backgrounds, accents

  // Secondary Brand Colors
  secondary: '#2d2d2d',     // Charcoal - dark backgrounds, primary text
  tertiary: '#ffffff',      // White
  accent: '#4ecdc4',        // Teal - success states, progress, navigation

  // Additional Brand Colors
  teal: '#4ecdc4',          // Success states, progress
  yellow: '#ffe66d',        // Warnings, achievements, highlights
  mint: '#95e1d3',          // Subtle accents, backgrounds

  // Background Colors - Light Mode
  bgMain: '#fafafa',        // Off White - main background
  bgCard: '#ffffff',        // White - card backgrounds
  bgDark: '#2d2d2d',        // Charcoal - dark mode background
  bgCream: '#fef9f3',       // Cream - warm backgrounds
  bgActionCard: '#fff5f5',  // Light coral tint
  bgNavbar: '#2d2d2d',      // Dark navbar
  bgForm: '#ffffff',        // White form backgrounds

  // Border Colors
  borderAccent: '#ff6b6b',  // Primary coral for emphasis
  borderDefault: '#e0e0e0', // Gray 200 for default borders

  // Effect Colors
  radialBlur: {
    primary: 'rgba(255, 107, 107, 0.35)',  // Coral with opacity
    accent: 'rgba(78, 205, 196, 0.4)',      // Teal with opacity
    secondary: 'rgba(45, 45, 45, 0.5)',     // Charcoal with opacity
  },

  // Text Colors
  textPrimary: '#2d2d2d',   // Charcoal - primary text
  textSecondary: '#4a4a4a', // Gray 700 - secondary text
  textTertiary: '#888888',  // Gray 500 - muted text
  textLight: '#ffffff',     // White - on dark backgrounds

  // Status Colors
  success: '#4ecdc4',       // Teal
  warning: '#ffe66d',       // Yellow
  error: '#ff6b6b',         // Coral (also primary)
  info: '#4ecdc4',          // Teal

  // Shadow Colors
  shadowAccent: 'rgba(255, 107, 107, 0.3)',
  shadowSoft: 'rgba(0, 0, 0, 0.05)',

  // Gray Scale (from brand guidelines)
  gray50: '#fafafa',        // Off White
  gray100: '#f5f5f5',
  gray200: '#e0e0e0',       // Borders, dividers
  gray300: '#cccccc',
  gray400: '#aaaaaa',
  gray500: '#888888',       // Muted text, borders
  gray600: '#666666',
  gray700: '#4a4a4a',       // Secondary elements
  gray800: '#3d3d3d',
  gray900: '#2d2d2d',       // Charcoal

  // Black/White
  black: '#000000',
  white: '#ffffff',

  // Node Type Colors (aligned with brand)
  node: {
    // Problem - uses primary coral (needs attention)
    problem: {
      border: '#ff6b6b',
      bg: 'rgba(255, 107, 107, 0.15)',
      text: '#ff6b6b',
    },
    // Objective - uses teal (goal-oriented)
    objective: {
      border: '#4ecdc4',
      bg: 'rgba(78, 205, 196, 0.15)',
      text: '#4ecdc4',
    },
    // Key Result - uses darker teal
    keyresult: {
      border: '#3dbdb4',
      bg: 'rgba(61, 189, 180, 0.15)',
      text: '#3dbdb4',
    },
    // Metric - uses mint (data-driven)
    metric: {
      border: '#95e1d3',
      bg: 'rgba(149, 225, 211, 0.15)',
      text: '#3dbdb4',
    },
    // Doc - neutral gray (content container)
    doc: {
      border: '#888888',
      bg: 'rgba(136, 136, 136, 0.1)',
      text: '#4a4a4a',
    },
    // Agent - uses coral variant (AI-powered)
    agent: {
      border: '#ff8e8e',
      bg: 'rgba(255, 142, 142, 0.15)',
      text: '#e85555',
    },
    // API - uses charcoal
    api: {
      border: '#4a4a4a',
      bg: 'rgba(74, 74, 74, 0.15)',
      text: '#4a4a4a',
    },
    // Webhook - uses yellow (warnings/notifications)
    webhook: {
      border: '#ffe66d',
      bg: 'rgba(255, 230, 109, 0.2)',
      text: '#c9a800',
    },
    // MCP - uses coral light
    mcp: {
      border: '#ff8e8e',
      bg: 'rgba(255, 142, 142, 0.15)',
      text: '#e85555',
    },
    // Integration - uses teal variant
    integration: {
      border: '#95e1d3',
      bg: 'rgba(149, 225, 211, 0.15)',
      text: '#3dbdb4',
    },
    // Custom - neutral gray
    custom: {
      border: '#aaaaaa',
      bg: 'rgba(170, 170, 170, 0.1)',
      text: '#888888',
    },
  },
}
