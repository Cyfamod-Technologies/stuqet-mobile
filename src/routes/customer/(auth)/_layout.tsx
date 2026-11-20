import { Stack } from "expo-router";
import { useThemeColors } from "~/lib/colors";

// Auth screens draw their own chrome (back button, blobs), so no native header.
export default function AuthLayout() {
  const palette = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.authBackground },
        animation: "slide_from_right",
      }}
    />
  );
}
