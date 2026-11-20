import { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { isVendorApp } from "~/lib/config/features";
import { hasToken } from "~/lib/secure-storage";
import { useThemeStore } from "~/lib/stores/theme-store";

const COPY = isVendorApp
  ? {
      title: "Run your shop from your phone",
      body: "Manage orders, products and payouts in one place.",
    }
  : {
      title: "Everything on campus, delivered",
      body: "Order from your favourite shops and track it to your door.",
    };

// Splash → redirects signed-in users to the tabs, otherwise shows the welcome
// pitch with a "Get started" CTA into sign-in.
export function WelcomeScreen() {
  const isDark = useThemeStore((s) => s.theme) === "dark";

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(16);
  const [showGetStarted, setShowGetStarted] = useState(false);

  useEffect(() => {
    hasToken().then((authenticated) => {
      if (authenticated) {
        router.replace("/(tabs)");
      } else {
        setShowGetStarted(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!showGetStarted) return;
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(
      150,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
  }, [showGetStarted, contentOpacity, contentTranslateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center overflow-hidden bg-background px-6">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View
        pointerEvents="none"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-tint opacity-80"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-tint opacity-60"
      />

      <Logo size="xl" />

      {showGetStarted && (
        <Animated.View
          style={[
            contentStyle,
            { position: "absolute", bottom: 0, left: 0, right: 0 },
          ]}
          className="gap-6 px-6 pb-16"
        >
          <View className="gap-2">
            <Text variant="display">{COPY.title}</Text>
            <Text tone="muted">{COPY.body}</Text>
          </View>

          <Button onPress={() => router.replace("/(auth)/login")}>
            Get started
          </Button>
        </Animated.View>
      )}
    </View>
  );
}
