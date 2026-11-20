/**
 * Feature flags driven by public env vars (`EXPO_PUBLIC_*`), inlined into the
 * bundle at build time. Keep these here so gating logic lives in one place.
 */

/**
 * Which of the two apps this binary is, resolved at build time from
 * `EXPO_PUBLIC_ROUTE` (the same value `app.config.ts` and `metro.config.js`
 * read). Shared components and hooks branch on this instead of hardcoding an
 * app, so the same code can serve both.
 */
export type AppRoute = "customer" | "vendor";

export const APP_ROUTE: AppRoute =
  process.env.EXPO_PUBLIC_ROUTE === "vendor" ? "vendor" : "customer";

export const isCustomerApp = APP_ROUTE === "customer";
export const isVendorApp = APP_ROUTE === "vendor";

/**
 * Whether the light/dark theme switch (`ThemeToggle`) is shown.
 *
 * Visible by default; set `EXPO_PUBLIC_ENABLE_THEME_SWITCH="false"` to hide it —
 * e.g. to lock the app to a single theme.
 */
export const isThemeSwitchEnabled =
  process.env.EXPO_PUBLIC_ENABLE_THEME_SWITCH !== "false";
