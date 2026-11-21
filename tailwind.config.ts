import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  // Tailwind loads this file in Node, where `require` is the supported way to pull in a preset.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        authBackground: "var(--authBackground)",
        field: "var(--field)",
        hint: "var(--hint)",
        subtle: "var(--subtle)",
        pill: "var(--pill)",
        "neutral-text": "var(--neutral-text)",
        control: "var(--control)",
        divider: "var(--divider)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        "brand-text": "var(--brand-text)",
        tint: {
          DEFAULT: "var(--tint)",
          border: "var(--tint-border)",
          deep: "var(--tint-deep)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
          tint: "var(--destructive-tint)",
          text: "var(--destructive-text)",
          border: "var(--destructive-border)",
        },
        success: {
          DEFAULT: "var(--success)",
          tint: "var(--success-tint)",
          text: "var(--success-text)",
          border: "var(--success-border)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          tint: "var(--warning-tint)",
          text: "var(--warning-text)",
          border: "var(--warning-border)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
      },
      // React Native needs one font family per weight (fontWeight is ignored
      // for custom fonts on Android), so pick a weight via the family class:
      // `font-sans-bold`, not `font-bold`.
      fontFamily: {
        sans: ["Urbanist-Regular"],
        "sans-medium": ["Urbanist-Medium"],
        "sans-semibold": ["Urbanist-SemiBold"],
        "sans-bold": ["Urbanist-Bold"],
        "sans-extrabold": ["Urbanist-ExtraBold"],
      },
      borderRadius: {
        field: "14px",
        tile: "14px",
        card: "20px",
        sheet: "28px",
        pill: "9999px",
        checkbox: "8px",
      },
      height: {
        field: "52px",
        button: "56px",
      },
      minHeight: {
        field: "52px",
        button: "56px",
      },
    },
  },
  plugins: [],
};

export default config;
