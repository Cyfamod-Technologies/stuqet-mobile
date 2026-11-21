import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SHADOWS } from "~/lib/colors";

// Pinned white bar at the bottom of a form or detail screen that holds the
// primary action(s) (boards: 12/20 padding, top hairline, soft upward shadow).
// Render it as a sibling after the scrolling content.
export function ActionBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-3 border-t border-border bg-card px-5 pt-3"
      style={[SHADOWS.bar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
    >
      {children}
    </View>
  );
}
