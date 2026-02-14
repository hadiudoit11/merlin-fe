/**
 * Typequest Brand Colors
 * 
 * This is the ONLY place to define colors for the entire application.
 * Aligned with typequest-brand-guidelines.jsx
 * 
 * Brand Identity:
 * - Primary: Coral (#ff6b6b) - CTAs, highlights, brand accent
 * - Secondary: Teal (#4ecdc4) - Success, progress, navigation
 * - Accent: Yellow (#ffe66d) - Warnings, achievements, highlights
 * - Neutral: Charcoal/Grays - Text, borders, backgrounds
 * - Backgrounds: Off-white, Cream - Warm, inviting surfaces
 */

export const colors = {
  // ═══════════════════════════════════════════════════════════
  // Brand Colors (Typequest Identity)
  // ═══════════════════════════════════════════════════════════
  
  // Primary - Coral (Brand heart)
  primary: '#ff6b6b',           // Main brand color
  primaryDark: '#e85555',       // Hover states, emphasis
  primaryLight: '#ff8e8e',      // Backgrounds, accents
  
  // Secondary - Teal (Success & Progress)
  secondary: '#4ecdc4',         // Success states, progress indicators
  secondaryDark: '#3db5ad',     // Active states
  secondaryLight: '#7dd9d3',    // Subtle backgrounds
  
  // Accent - Yellow (Achievements & Warnings)
  accent: '#ffe66d',            // Highlights, achievements
  accentDark: '#f4d747',        // Darker variant
  accentLight: '#fff29a',       // Backgrounds
  
  // Tertiary - Mint (Subtle accents)
  tertiary: '#95e1d3',          // Soft backgrounds, calm accents
  
  // ═══════════════════════════════════════════════════════════
  // Neutral Colors
  // ═══════════════════════════════════════════════════════════
  
  charcoal: '#2d2d2d',          // Primary text, dark backgrounds
  
  // Grays
  gray700: '#4a4a4a',           // Secondary elements
  gray500: '#888888',           // Muted text, borders
  gray200: '#e0e0e0',           // Borders, dividers
  
  // Background neutrals
  offWhite: '#fafafa',          // Main background
  cream: '#fef9f3',             // Warm backgrounds
  white: '#ffffff',             // Pure white
  
  // ═══════════════════════════════════════════════════════════
  // Background Colors
  // ═══════════════════════════════════════════════════════════
  
  bgMain: '#fafafa',            // Off-white primary background
  bgCard: '#ffffff',            // Card backgrounds
  bgDark: '#2d2d2d',            // Dark mode / terminal backgrounds
  bgForm: '#ffffff',            // Form backgrounds
  bgActionCard: '#fff5f5',      // Coral-tinted card background
  bgNavbar: '#ffffff',          // Navbar background
  bgCream: '#fef9f3',           // Warm background variant
  
  // ═══════════════════════════════════════════════════════════
  // Border Colors
  // ═══════════════════════════════════════════════════════════
  
  border: '#e0e0e0',            // Default borders
  borderAccent: '#ff6b6b',      // Brand accent borders
  borderLight: '#f5f5f5',       // Very subtle borders
  
  // ═══════════════════════════════════════════════════════════
  // Text Colors
  // ═══════════════════════════════════════════════════════════
  
  textPrimary: '#2d2d2d',       // Charcoal - main text
  textSecondary: '#4a4a4a',     // Gray 700 - secondary text
  textTertiary: '#888888',      // Gray 500 - muted text
  textLight: '#ffffff',         // White text on dark backgrounds
  textOnBrand: '#ffffff',       // White text on coral/teal/yellow
  
  // ═══════════════════════════════════════════════════════════
  // Status Colors
  // ═══════════════════════════════════════════════════════════
  
  success: '#4ecdc4',           // Teal - success states
  warning: '#ffe66d',           // Yellow - warnings
  error: '#ff6b6b',             // Coral - errors (softer than typical red)
  info: '#5dade2',              // Blue - informational
  
  // ═══════════════════════════════════════════════════════════
  // Effect Colors (Radial blurs, glows, shadows)
  // ═══════════════════════════════════════════════════════════
  
  radialBlur: {
    primary: 'rgba(255, 107, 107, 0.15)',   // Coral glow
    secondary: 'rgba(78, 205, 196, 0.15)',  // Teal glow
    accent: 'rgba(255, 230, 109, 0.2)',     // Yellow glow
  },
  
  shadowAccent: 'rgba(255, 107, 107, 0.3)', // Coral shadow
  shadowSoft: 'rgba(0, 0, 0, 0.05)',        // Soft shadow for cards
  shadowMedium: 'rgba(0, 0, 0, 0.1)',       // Medium shadow
  
  // ═══════════════════════════════════════════════════════════
  // Gray Scale (Extended for fine control)
  // ═══════════════════════════════════════════════════════════
  
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e0e0e0',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#888888',
  gray600: '#737373',
  gray700: '#4a4a4a',
  gray800: '#3a3a3a',
  gray900: '#2d2d2d',
  
  black: '#000000',
  
  // ═══════════════════════════════════════════════════════════
  // Node Type Colors (Canvas nodes)
  // ═══════════════════════════════════════════════════════════
  
  node: {
    // Problem - Red-coral (urgent, needs attention)
    problem: {
      border: '#e85555',
      bg: 'rgba(232, 85, 85, 0.08)',
      text: '#e85555',
      icon: '❗',
    },
    
    // Objective - Coral (primary goal)
    objective: {
      border: '#ff6b6b',
      bg: 'rgba(255, 107, 107, 0.05)',
      text: '#ff6b6b',
      icon: '🎯',
    },
    
    // Key Result - Teal (measurable progress)
    keyresult: {
      border: '#4ecdc4',
      bg: 'rgba(78, 205, 196, 0.08)',
      text: '#3db5ad',
      icon: '📊',
    },
    
    // Metric - Blue-teal (data-driven)
    metric: {
      border: '#5dade2',
      bg: 'rgba(93, 173, 226, 0.08)',
      text: '#5dade2',
      icon: '📈',
    },
    
    // Doc - Neutral gray (content container)
    doc: {
      border: '#888888',
      bg: 'rgba(136, 136, 136, 0.05)',
      text: '#4a4a4a',
      icon: '📄',
    },
    
    // Agent - Yellow (AI-powered, magic)
    agent: {
      border: '#ffe66d',
      bg: 'rgba(255, 230, 109, 0.1)',
      text: '#d4b13f',
      icon: '✨',
    },
    
    // API - Charcoal (technical)
    api: {
      border: '#4a4a4a',
      bg: 'rgba(74, 74, 74, 0.05)',
      text: '#2d2d2d',
      icon: '🔌',
    },
    
    // Webhook - Mint (integration connector)
    webhook: {
      border: '#95e1d3',
      bg: 'rgba(149, 225, 211, 0.1)',
      text: '#6bb5a7',
      icon: '🪝',
    },
    
    // MCP - Teal variant (protocol)
    mcp: {
      border: '#7dd9d3',
      bg: 'rgba(125, 217, 211, 0.1)',
      text: '#4ecdc4',
      icon: '🤖',
    },
    
    // Integration - Mixed (external service)
    integration: {
      border: '#95e1d3',
      bg: 'rgba(149, 225, 211, 0.08)',
      text: '#6bb5a7',
      icon: '🔗',
    },
    
    // Custom - Neutral light gray
    custom: {
      border: '#a3a3a3',
      bg: 'rgba(163, 163, 163, 0.05)',
      text: '#737373',
      icon: '⚙️',
    },
  },
  
  // ═══════════════════════════════════════════════════════════
  // Integration Status Colors
  // ═══════════════════════════════════════════════════════════
  
  integration: {
    connected: '#4ecdc4',      // Teal - connected
    syncing: '#ffe66d',        // Yellow - syncing
    warning: '#f4d747',        // Darker yellow - issues
    error: '#ff6b6b',          // Coral - disconnected
  },
  
  // ═══════════════════════════════════════════════════════════
  // Task Source Colors (for badges - keep brand-specific)
  // ═══════════════════════════════════════════════════════════
  
  taskSource: {
    manual: '#888888',         // Gray - manual
    zoom: '#5865f2',           // Zoom blue
    slack: '#e01e5a',          // Slack magenta
    jira: '#0052cc',           // Jira blue
    ai: '#ffe66d',             // Yellow - AI-extracted
    linear: '#5e6ad2',         // Linear purple
    email: '#ea4335',          // Gmail red
    calendar: '#34a853',       // Calendar green
  },
}
