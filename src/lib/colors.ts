import { useThemeStore } from "~/lib/stores/theme-store";

// Both apps share one palette; only the brand accent can differ per app. Keep
// per-app differences here (and in app.config.ts's `extra.brand`) so the rest of
// the theme, the UI kit and the hooks stay shared.
const BRAND_COLORS = {
  customer: { primary: "#EB6C1A", primaryForeground: "#FFFFFF" },
  vendor: { primary: "#EB6C1A", primaryForeground: "#FFFFFF" },
} as const;

const brandColors =
  BRAND_COLORS[
    process.env.EXPO_PUBLIC_ROUTE === "vendor" ? "vendor" : "customer"
  ];

/*
 * Stuqet design system — colour tokens. See docs/DESIGN.md.
 *
 * Every token becomes a CSS variable (`--<key>`, see theme-vars.ts) mapped to a
 * Tailwind colour in tailwind.config.ts, so `bg-field`, `text-brand-text`,
 * `border-tint-border` etc. all follow the active theme.
 *
 * Contrast notes (light): white on `primary` is 3.1:1, so it is only used for
 * large/bold text (buttons are 19px bold). Orange *text* on a light surface
 * must use `brand-text` (5.3:1), never `primary`.
 */

// Light theme — off-white screens, white shadowed fields.
export const lightColors = {
  // Surfaces
  background: "#FBFAF8",
  authBackground: "#FBFAF8",
  card: "#FFFFFF",
  popover: "#FFFFFF",
  field: "#FFFFFF",
  secondary: "#F4F1EC",
  muted: "#F4F1EC",
  accent: "#FDF0E6",

  // Text
  foreground: "#1C1917",
  "card-foreground": "#1C1917",
  "popover-foreground": "#1C1917",
  "secondary-foreground": "#1C1917",
  "muted-foreground": "#6B6560",
  hint: "#9A938B",
  "accent-foreground": "#B54A08",

  // Brand
  primary: brandColors.primary,
  "primary-foreground": brandColors.primaryForeground,
  "brand-text": "#B54A08",
  tint: "#FDF0E6",
  "tint-border": "#F8D9C0",
  ring: brandColors.primary,

  // Lines
  border: "#E7E2DA",
  input: "#E7E2DA",

  // Status
  destructive: "#EF486A",
  "destructive-foreground": "#FFFFFF",
  "destructive-tint": "#FDECF0",
  "destructive-text": "#C42048",
  success: "#1F9D61",
  "success-tint": "#E8F6EE",
  "success-text": "#12724A",
  warning: "#D97706",
  "warning-tint": "#FEF3E2",
} as const;

// Dark theme — warm near-black screens, raised charcoal fields.
export const darkColors = {
  // Surfaces
  background: "#121110",
  authBackground: "#121110",
  card: "#1C1A18",
  popover: "#1C1A18",
  field: "#1C1A18",
  secondary: "#26231F",
  muted: "#26231F",
  accent: "#2A1A0F",

  // Text
  foreground: "#F5F2EE",
  "card-foreground": "#F5F2EE",
  "popover-foreground": "#F5F2EE",
  "secondary-foreground": "#F5F2EE",
  "muted-foreground": "#A8A199",
  hint: "#7A736B",
  "accent-foreground": "#F4934F",

  // Brand
  primary: brandColors.primary,
  "primary-foreground": brandColors.primaryForeground,
  "brand-text": "#F4934F",
  tint: "#2A1A0F",
  "tint-border": "#4A2C16",
  ring: brandColors.primary,

  // Lines
  border: "#2E2A26",
  input: "#2E2A26",

  // Status
  destructive: "#F4607F",
  "destructive-foreground": "#FFFFFF",
  "destructive-tint": "#33161D",
  "destructive-text": "#FF8FA6",
  success: "#34C07F",
  "success-tint": "#10261B",
  "success-text": "#6FDBA6",
  warning: "#F59E0B",
  "warning-tint": "#2E200A",
} as const;

// Shadows can't be expressed as theme variables in React Native, so they are
// style constants. Radii, heights and type live in tailwind.config.ts.
export const SHADOWS = {
  // Soft lift under white fields on the off-white screen.
  field: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // Orange glow under the primary pill button.
  button: {
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  // Orange glow around a checked checkbox.
  glow: {
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

// Default export kept for any direct usages outside Tailwind/NativeWind vars.
// The apps ship light-first, so static usages match the light palette; use
// `useThemeColors()` anywhere that must follow dark mode.
export const colors = lightColors;

// React hook — returns the correct palette for the active theme.
// theme-store does not import from colors.ts, so there is no circular dep.
export function useThemeColors() {
  const theme = useThemeStore((s) => s.theme);
  return theme === "dark" ? darkColors : lightColors;
}
