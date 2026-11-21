import { DefaultTheme } from "expo-router";

/**
 * React Navigation paints every stack and tab scene with `colors.background`
 * (rgb(242, 242, 242) by default) behind our own `contentStyle`, which covers
 * the peach Backdrop. A transparent background lets the Backdrop show on every
 * screen; screens, cards and bars keep their own fills.
 */
export const transparentNavigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "transparent" },
};
