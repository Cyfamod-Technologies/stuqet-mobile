import "./global.css";

import { useEffect } from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from "@expo-google-fonts/urbanist";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import TanstackQueryProvider from "~/providers/tanstack-query";
import { initSentry } from "~/lib/config/sentry";
import { DebugOverlay } from "~/components/debug-overlay";
import { OfflineBanner } from "~/components/offline-banner";
import { OTAUpdateHandler } from "~/components/ota-update-handler";
import { ForceUpdateModal } from "~/components/force-update-modal";
import { isDebugOverlayEnabled } from "~/lib/debug-store";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkThemeVars, lightThemeVars } from "~/lib/theme-vars";
import { Backdrop } from "~/components/backdrop";
import { useThemeColors } from "~/lib/colors";
import { registerSessionExpiryHandler } from "~/features/auth/session-expiry";

SplashScreen.preventAutoHideAsync();
initSentry();
// A 401 on an authenticated request lands on the "Session expired" screen.
registerSessionExpiryHandler();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Urbanist-Regular": Urbanist_400Regular,
    "Urbanist-Medium": Urbanist_500Medium,
    "Urbanist-SemiBold": Urbanist_600SemiBold,
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-ExtraBold": Urbanist_800ExtraBold,
  });

  const { theme, hydrate } = useThemeStore();
  const palette = useThemeColors();

  const ready = fontsLoaded || fontError != null;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TanstackQueryProvider>
          <View
            style={[
              { flex: 1, backgroundColor: palette.background },
              theme === "dark" ? darkThemeVars : lightThemeVars,
            ]}
          >
            <Backdrop />
            <OfflineBanner />
            <ForceUpdateModal />
            <Slot />
            <OTAUpdateHandler />
            {isDebugOverlayEnabled ? <DebugOverlay /> : null}
          </View>
        </TanstackQueryProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
