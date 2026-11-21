import { Stack } from "expo-router";

// Auth screens draw their own chrome (back button, blobs), so no native header.
// Fingerprint login is a bottom sheet over the login form, so it is a
// transparent modal that fades in.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="fingerprint-login"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
