import { View } from "react-native";

// The soft peach corner circles behind every screen (design system, see
// docs/DESIGN.md). Rendered once by each app's root layout; screens and
// navigators are transparent so it shows through. Cards, tab bars and action
// bars stay opaque.
export function Backdrop() {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 overflow-hidden"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-tint" />
      <View className="absolute -right-8 -top-14 h-40 w-40 rounded-full bg-tint-border opacity-60" />
    </View>
  );
}
