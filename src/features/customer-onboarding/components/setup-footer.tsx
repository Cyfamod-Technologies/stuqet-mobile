import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Buttons pinned under a set-up or onboarding screen. The boards draw them
// straight on the page (no white bar), unlike the ordering screens' ActionBar.
export function SetupFooter({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="gap-3 px-5 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
    >
      {children}
    </View>
  );
}
