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

// Light theme — off-white screens, white shadowed fields. Values come from the
// Themes board (Light) and the vendor app boards.
export const lightColors = {
  // Surfaces
  background: "#FBFAF8",
  authBackground: "#FBFAF8",
  card: "#FFFFFF",
  popover: "#FFFFFF",
  field: "#FFFFFF",
  secondary: "#F1ECE6", // segmented track, neutral pill/button fill
  muted: "#F6F0EA", // soft fill: locked fields, pressed rows
  accent: "#FFF1E7",
  pill: "#FFFFFF", // selected segment

  // Text
  foreground: "#1B130C",
  "card-foreground": "#1B130C",
  "popover-foreground": "#1B130C",
  "secondary-foreground": "#1B130C",
  "muted-foreground": "#6B5E54",
  hint: "#7A6C60", // placeholders
  subtle: "#A39588", // chevrons, disabled icons
  "neutral-text": "#4A3F36", // text on neutral badges
  "accent-foreground": "#B54A08",

  // Brand
  primary: brandColors.primary,
  "primary-foreground": brandColors.primaryForeground,
  "brand-text": "#B54A08",
  tint: "#FFF1E7",
  "tint-border": "#F6D5BE",
  "tint-deep": "#FFE2CF", // decor circles, logo-monogram tile
  ring: brandColors.primary,

  // Lines
  border: "#E4DCD3",
  input: "#E4DCD3",
  "border-strong": "#D9CBBE", // OTP boxes, secondary controls
  control: "#CFC3B8", // unchecked checkbox border, toggle off track
  divider: "#F0EAE3", // hairline between rows inside a card

  // Status
  destructive: "#EF486A",
  "destructive-foreground": "#FFFFFF",
  "destructive-tint": "#FDECF0",
  "destructive-text": "#C42048",
  "destructive-border": "#F6C7D2",
  success: "#1F9D61",
  "success-tint": "#E8F6EE",
  "success-text": "#12724A",
  "success-border": "#BFE5D0",
  warning: "#D97706",
  "warning-tint": "#FFF4DC",
  "warning-text": "#7A4B00",
  "warning-border": "#F0D9A0",
} as const;

// Dark theme — warm near-black screens, raised charcoal fields. Values come
// from the Themes board (Dark).
export const darkColors = {
  // Surfaces
  background: "#14100C",
  authBackground: "#14100C",
  card: "#1E1812",
  popover: "#1E1812",
  field: "#1E1812",
  secondary: "#271F18",
  muted: "#271F18",
  accent: "#2E1D12",
  pill: "#3A3027",

  // Text
  foreground: "#F7F2EC",
  "card-foreground": "#F7F2EC",
  "popover-foreground": "#F7F2EC",
  "secondary-foreground": "#F7F2EC",
  "muted-foreground": "#BDB0A4",
  hint: "#A09286",
  subtle: "#857363",
  "neutral-text": "#D8CCC0",
  "accent-foreground": "#FF9B5A",

  // Brand
  primary: brandColors.primary,
  "primary-foreground": brandColors.primaryForeground,
  "brand-text": "#FF9B5A",
  tint: "#2E1D12",
  "tint-border": "#5A361C",
  "tint-deep": "#3D2514",
  ring: brandColors.primary,

  // Lines
  border: "#3A3027",
  input: "#3A3027",
  "border-strong": "#5A4C3F",
  control: "#857363",
  divider: "#2B231B",

  // Status
  destructive: "#F4607F",
  "destructive-foreground": "#FFFFFF",
  "destructive-tint": "#3A1517",
  "destructive-text": "#FF6B73",
  "destructive-border": "#6B2A2E",
  success: "#34C07F",
  "success-tint": "#11281D",
  "success-text": "#4CC38A",
  "success-border": "#1E5A3C",
  warning: "#F59E0B",
  "warning-tint": "#2E200A",
  "warning-text": "#F5C26B",
  "warning-border": "#5A4310",
} as const;

// Shadows can't be expressed as theme variables in React Native, so they are
// style constants. Radii, heights and type live in tailwind.config.ts.
export const SHADOWS = {
  // Soft lift under white fields and cards: 0 2px 8px rgba(27,19,12,.06).
  field: {
    shadowColor: "#1B130C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // Orange glow under the primary pill button (board: 0 10px 20px -8px
  // rgba(235,108,26,.6); React Native has no spread, so the radius is tighter).
  button: {
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
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
  // Selected segment of the pill SegmentedControl: 0 1px 3px rgba(27,19,12,.12).
  pill: {
    shadowColor: "#1B130C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  // Toggle thumb: 0 1px 3px rgba(27,19,12,.25).
  thumb: {
    shadowColor: "#1B130C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  // Pinned bottom bars (tab bar, action bar): 0 -4px 16px rgba(27,19,12,.05).
  bar: {
    shadowColor: "#1B130C",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  // Bottom sheet: 0 -12px 40px rgba(27,19,12,.25).
  sheet: {
    shadowColor: "#1B130C",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
} as const;

// Brand-mark art (Logo.dc board): fixed in both themes, so they live here as
// constants rather than theme variables. Only the tile/glyph pairs the logo
// needs are listed; screens never use these directly.
export const LOGO_COLORS = {
  brand: brandColors.primary,
  onBrand: "#FFFFFF",
  white: "#FFFFFF",
  ink: "#1B130C",
  inkOnDark: "#1E1812",
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
