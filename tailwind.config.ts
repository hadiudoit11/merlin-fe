import type { Config } from "tailwindcss";
import { colors } from "./src/styles/colors";
import plugin from "tailwindcss/plugin";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			// Typequest Brand Fonts
  			primary: [
  				"Fraunces",
  				"Georgia",
  				"serif"
  			],
  			secondary: [
  				"Space Grotesk",
  				"system-ui",
  				"sans-serif"
  			],
  			mono: [
  				"JetBrains Mono",
  				"monospace"
  			],
  			// Aliases for brand usage
  			headline: [
  				"Fraunces",
  				"Georgia",
  				"serif"
  			],
  			body: [
  				"Space Grotesk",
  				"system-ui",
  				"sans-serif"
  			],
  			nav: [
  				"Plus Jakarta Sans",
  				"system-ui",
  				"sans-serif"
  			],
  		},
  		colors: {
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))"
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))"
  			},
  			tertiary: colors.tertiary,
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))"
  			},
  			bg: {
  				main: colors.bgMain,
  				card: colors.bgCard,
  				dark: colors.bgDark,
  				form: colors.bgForm,
  				actionCard: colors.bgActionCard,
  				navbar: colors.bgNavbar
  			},
  			border: "hsl(var(--border))",
  			text: {
  				primary: colors.textPrimary,
  				secondary: colors.textSecondary,
  				light: colors.textLight,
  				tertiary: colors.textTertiary
  			},
  			status: {
  				success: colors.success,
  				warning: colors.warning,
  				error: colors.error,
  				info: colors.info
  			},
  			blur: {
  				primary: colors.radialBlur.primary,
  				accent: colors.radialBlur.accent,
  				secondary: colors.radialBlur.secondary
  			},
  			gray: {
  				"50": colors.gray50,
  				"100": colors.gray100,
  				"200": colors.gray200,
  				"300": colors.gray300,
  				"400": colors.gray400,
  				"500": colors.gray500,
  				"600": colors.gray600,
  				"700": colors.gray700,
  				"800": colors.gray800,
  				"900": colors.gray900
  			},
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))"
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))"
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))"
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))"
  			},
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			chart: {
  				"1": "hsl(var(--chart-1))",
  				"2": "hsl(var(--chart-2))",
  				"3": "hsl(var(--chart-3))",
  				"4": "hsl(var(--chart-4))",
  				"5": "hsl(var(--chart-5))"
  			},
  			sidebar: {
  				DEFAULT: "hsl(var(--sidebar-background))",
  				foreground: "hsl(var(--sidebar-foreground))",
  				primary: "hsl(var(--sidebar-primary))",
  				"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
  				accent: "hsl(var(--sidebar-accent))",
  				"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
  				border: "hsl(var(--sidebar-border))",
  				ring: "hsl(var(--sidebar-ring))"
  			}
  		},
  		boxShadow: {
  			"accent-offset": `8px 8px 0 ${colors.shadowAccent}`
  		},
  		backgroundImage: {
  			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
  			"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
  			"onboarding-background": "url('/public/onboading_background.jpg')"
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
  		},
  		keyframes: {
  			"accordion-down": {
  				from: { height: "0" },
  				to: { height: "var(--radix-accordion-content-height)" }
  			},
  			"accordion-up": {
  				from: { height: "var(--radix-accordion-content-height)" },
  				to: { height: "0" }
  			}
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out"
  		}
  	}
  },
  plugins: [
    plugin(function({ addBase }) {
      addBase({
        ".radial-blur-tl": {
          position: "relative",
          overflow: "hidden"
        },
        ".radial-blur-tl::before": {
          content: '""',
          position: "absolute",
          top: "-40px",
          left: "-40px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: colors.radialBlur.primary,
          filter: "blur(25px)",
          zIndex: "0",
          pointerEvents: "none"
        },
        ".radial-blur-tr": {
          position: "relative",
          overflow: "hidden"
        },
        ".radial-blur-tr::before": {
          content: '""',
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: colors.radialBlur.primary,
          filter: "blur(25px)",
          zIndex: "0",
          pointerEvents: "none"
        },
        ".radial-blur-br": {
          position: "relative",
          overflow: "hidden"
        },
        ".radial-blur-br::before": {
          content: '""',
          position: "absolute",
          bottom: "-40px",
          right: "-40px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: colors.radialBlur.primary,
          filter: "blur(25px)",
          zIndex: "0",
          pointerEvents: "none"
        },
        ".radial-blur-bl": {
          position: "relative",
          overflow: "hidden"
        },
        ".radial-blur-bl::before": {
          content: '""',
          position: "absolute",
          bottom: "-40px",
          left: "-40px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: colors.radialBlur.primary,
          filter: "blur(25px)",
          zIndex: "0",
          pointerEvents: "none"
        },
        ".radial-blur-accent-tl::before": {
          background: colors.radialBlur.accent
        },
        ".radial-blur-accent-tr::before": {
          background: colors.radialBlur.accent
        },
        ".radial-blur-accent-br::before": {
          background: colors.radialBlur.accent
        },
        ".radial-blur-accent-bl::before": {
          background: colors.radialBlur.accent
        },
        ".radial-blur-secondary-tl::before": {
          background: colors.radialBlur.secondary
        },
        ".radial-blur-secondary-tr::before": {
          background: colors.radialBlur.secondary
        },
        ".radial-blur-secondary-br::before": {
          background: colors.radialBlur.secondary
        },
        ".radial-blur-secondary-bl::before": {
          background: colors.radialBlur.secondary
        }
      });
    }),
    require("tailwindcss-animate")
  ]
};
export default config;
