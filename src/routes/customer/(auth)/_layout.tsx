import { Stack } from "expo-router";

// Auth screens draw their own chrome (back button, blobs), so no native header.
export default function AuthLayout() {
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
