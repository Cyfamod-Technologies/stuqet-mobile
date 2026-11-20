import { Stack } from "expo-router";
import { useThemeColors } from "~/lib/colors";

// Stack for a tab's pushed screens. Screens draw their own header with
// <ScreenHeader>, so the native header is off.
export function PlainStack() {
  const palette = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
        animation: "slide_from_right",
      }}
    />
  );
}
