import { Theme } from "@/components/ui/theme-provider";

// Default Light Theme
export const defaultLightTheme: Theme = {
  name: "light",
  // Brand colors
  brandPrimary: "#3498db",
  brandSecondary: "#2ecc71",
  brandAccent: "#f39c12",
  // Background colors
  backgroundMain: "#f5f5f5",
  backgroundCard: "#ffffff",
  backgroundDark: "#282828",
  // Text colors
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#ffffff",
};

// Default Dark Theme
export const defaultDarkTheme: Theme = {
  name: "dark",
  // Brand colors
  brandPrimary: "#3a97d4",
  brandSecondary: "#27ae60",
  brandAccent: "#e67e22",
  // Background colors
  backgroundMain: "#1a1a1a",
  backgroundCard: "#2a2a2a",
  backgroundDark: "#121212",
  // Text colors
  textPrimary: "#f5f5f5",
  textSecondary: "#cccccc",
  textLight: "#ffffff",
};

// Typequest Theme - Official brand colors (replaces Carrot)
export const typequestTheme: Theme = {
  name: "typequest",
  // Brand colors - Coral, Teal, Yellow
  brandPrimary: "#ff6b6b",      // Coral
  brandSecondary: "#4ecdc4",    // Teal
  brandAccent: "#ffe66d",       // Yellow
  // Background colors
  backgroundMain: "#fafafa",    // Off-white
  backgroundCard: "#ffffff",    // Pure white
  backgroundDark: "#2d2d2d",    // Charcoal
  // Text colors
  textPrimary: "#2d2d2d",       // Charcoal
  textSecondary: "#4a4a4a",     // Gray 700
  textLight: "#ffffff",         // White
};

// Sunset Theme - Orange and purple
export const sunsetTheme: Theme = {
  name: "sunset",
  // Brand colors
  brandPrimary: "#ff7e5f",      // Coral orange
  brandSecondary: "#6b48ff",    // Purple
  brandAccent: "#feb47b",       // Light orange
  // Background colors
  backgroundMain: "#1f1135",    // Dark purple
  backgroundCard: "#ffffff",    // White
  backgroundDark: "#170b28",    // Very dark purple
  // Text colors
  textPrimary: "#f5f5f5",       // Light
  textSecondary: "#333333",     // Dark
  textLight: "#ffffff",         // White
};

// Ocean Theme - Blues and teals
export const oceanTheme: Theme = {
  name: "ocean",
  // Brand colors
  brandPrimary: "#00b8d9",      // Bright blue
  brandSecondary: "#0052cc",    // Dark blue
  brandAccent: "#36b37e",       // Teal
  // Background colors
  backgroundMain: "#f4f5f7",    // Light gray blue
  backgroundCard: "#ffffff",    // White
  backgroundDark: "#172b4d",    // Navy
  // Text colors
  textPrimary: "#172b4d",       // Dark blue
  textSecondary: "#6b778c",     // Gray
  textLight: "#ffffff",         // White
};

// All available themes
export const availableThemes: Theme[] = [
  defaultLightTheme,
  defaultDarkTheme,
  typequestTheme,      // Replaces carrotTheme
  sunsetTheme,
  oceanTheme
];
