import { isVendorApp } from "~/lib/config/features";

/**
 * Demo mode runs the vendor app against bundled sample data instead of the
 * Stuqet API (see src/demo/README.md). Turn it on with
 * `EXPO_PUBLIC_DEMO_MODE="true"` (`npm run dev:vendor:demo`).
 *
 * Keep this file tiny: feature code imports it for the flag only. Everything
 * else in src/demo is pulled in with `require()` behind a literal
 * `process.env.EXPO_PUBLIC_DEMO_MODE === "true"` check so release builds drop
 * the data and images.
 */
export const isDemoMode =
  isVendorApp && process.env.EXPO_PUBLIC_DEMO_MODE === "true";
