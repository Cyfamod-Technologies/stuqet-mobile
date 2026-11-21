import { useEffect } from "react";
import { StatusBar, View } from "react-native";
import { router } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import AuthService from "~/features/auth/api";
import { isBiometricAvailable } from "~/features/auth/biometrics";
import { BrandMark, VendorChip } from "~/features/auth/components/brand-mark";
import { useAuthStore } from "~/hooks/use-auth-store";
import {
  deleteToken,
  getRememberMe,
  getToken,
  isBiometricEnabled,
} from "~/lib/secure-storage";
import { useThemeStore } from "~/lib/stores/theme-store";

const SPLASH_MS = 1100;
const BAR_WIDTH = 120;
const BAR_FILL = 46;

type Destination = () => void;

// Decides where to go once the splash has been shown.
async function resolveDestination(): Promise<Destination> {
  const toWelcome: Destination = () => router.replace("/(auth)/welcome");

  const token = await getToken();
  if (!token) return toWelcome;

  // "Remember me" was off: the session only lasts until the app is closed.
  if (!(await getRememberMe())) {
    try {
      await AuthService.logout({ token });
    } catch {
      // Best effort: the token is dropped locally either way.
    }
    await deleteToken();
    return toWelcome;
  }

  // Fingerprint on: land on login and let it open the unlock sheet. The
  // session is only activated once the sensor confirms.
  if ((await isBiometricEnabled()) && (await isBiometricAvailable())) {
    return () =>
      router.replace({ pathname: "/(auth)/login", params: { unlock: "1" } });
  }

  useAuthStore.getState().setAuthToken({ access: token });
  return () => router.replace("/(tabs)");
}

// Splash board: "s." tile, wordmark, VENDOR chip, tagline and a progress bar.
// Doubles as the app's entry route: it routes to Welcome, the fingerprint
// unlock or straight into the tabs.
export function VendorSplashScreen() {
  const isDark = useThemeStore((s) => s.theme) === "dark";
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      resolveDestination(),
      new Promise<void>((resolve) => setTimeout(resolve, SPLASH_MS)),
    ]).then(([go]) => {
      if (!cancelled) go();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (BAR_WIDTH - BAR_FILL) }],
  }));

  return (
    <View className="flex-1 items-center justify-center">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center overflow-hidden"
      >
        <View className="bg-tint/50 absolute h-[520px] w-[520px] rounded-full" />
        <View className="bg-tint/80 absolute h-[400px] w-[400px] rounded-full" />
        <View className="bg-tint-border/60 absolute h-[280px] w-[280px] rounded-full" />
        <View className="absolute -bottom-[110px] -left-[90px] h-60 w-60 rounded-full bg-primary" />
        <View className="absolute right-[60px] top-[150px] h-3.5 w-3.5 rounded-full bg-primary" />
        <View className="absolute left-[46px] top-[120px] h-2.5 w-2.5 rounded-full bg-tint-border" />
        <View className="absolute bottom-[200px] right-11 h-2.5 w-2.5 rounded-full bg-tint-border" />
      </View>

      <View className="-mt-10 items-center gap-[18px]">
        <BrandMark size={120} glow />
        <View className="items-center gap-2">
          <Text
            className="font-sans-extrabold text-[44px] leading-[48px]"
            style={{ letterSpacing: -1.5 }}
          >
            stuqet
          </Text>
          <VendorChip large />
        </View>
      </View>

      <Text
        tone="muted"
        className="absolute bottom-[170px] font-sans-semibold text-base leading-6"
      >
        Your shop, in your pocket.
      </Text>
      <View
        className="absolute bottom-[130px] h-[5px] overflow-hidden rounded-full bg-secondary"
        style={{ width: BAR_WIDTH }}
      >
        <Animated.View
          className="h-[5px] rounded-full bg-primary"
          style={[{ width: BAR_FILL }, barStyle]}
        />
      </View>
    </View>
  );
}
