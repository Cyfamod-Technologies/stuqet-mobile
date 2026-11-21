import { Stack } from "expo-router";

// Stack for a tab's pushed screens. Screens draw their own header with
// <ScreenHeader>, so the native header is off.
export function PlainStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "fade",
      }}
    />
  );
}
