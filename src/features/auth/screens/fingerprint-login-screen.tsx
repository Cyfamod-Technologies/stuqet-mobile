import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import {
  unlockStoredSession,
  type UnlockOutcome,
} from "~/features/auth/biometrics";
import { FingerprintButton } from "~/features/auth/components/social-buttons";
import { resetSessionExpiry } from "~/features/auth/session-expiry";
import { SHADOWS } from "~/lib/colors";
import { notifyInfo } from "~/lib/utils/toast";

type ScanState = "scanning" | "idle" | "failed";

// "Log in with fingerprint" bottom sheet, presented over the login form as a
// transparent modal route. It prompts on open; on success the session token
// already in secure storage becomes the active session. "Use password" and
// "Cancel" return to the form.
export function FingerprintLoginScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ScanState>("scanning");

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/login");
  }, []);

  const handleOutcome = useCallback(
    (outcome: UnlockOutcome) => {
      if (outcome.ok) {
        resetSessionExpiry();
        router.replace("/(tabs)");
        return;
      }
      switch (outcome.reason) {
        case "cancelled":
          setState("idle");
          break;
        case "failed":
          setState("failed");
          break;
        case "no-session":
          notifyInfo({
            message: "Log in with your password first",
            description:
              "Fingerprint login unlocks a saved session. Log in once to save one.",
          });
          close();
          break;
        case "unavailable":
          notifyInfo({
            message: "Fingerprint isn't available",
            description: "Use your password to log in.",
          });
          close();
          break;
      }
    },
    [close],
  );

  // Prompt as soon as the sheet opens (the state starts as "scanning").
  useEffect(() => {
    unlockStoredSession().then(handleOutcome);
  }, [handleOutcome]);

  const retry = () => {
    setState("scanning");
    unlockStoredSession().then(handleOutcome);
  };

  return (
    <View className="flex-1 justify-end">
      <Pressable
        accessibilityLabel="Cancel fingerprint login"
        onPress={close}
        className="absolute inset-0 bg-black/55"
      />
      <View
        accessibilityViewIsModal
        style={[
          SHADOWS.field,
          { paddingBottom: Math.max(insets.bottom, 12) + 20 },
        ]}
        className="items-center rounded-t-[28px] bg-card px-6 pt-3"
      >
        <View className="h-[5px] w-10 rounded-full bg-border" />

        <View className="mt-7">
          <FingerprintButton
            large
            onPress={retry}
            disabled={state === "scanning"}
          />
        </View>

        <Text
          accessibilityRole="header"
          className="mt-5 text-center font-sans-extrabold text-2xl leading-[30px]"
          style={{ letterSpacing: -0.3 }}
        >
          Log in with fingerprint
        </Text>
        <Text
          tone={state === "failed" ? "error" : "muted"}
          className="mt-1.5 max-w-[280px] text-center font-sans-medium text-base leading-[22px]"
        >
          {state === "failed"
            ? "Fingerprint not recognised. Try again."
            : "Touch the fingerprint sensor to continue."}
        </Text>

        <Pressable
          onPress={close}
          accessibilityRole="button"
          className="mt-4 min-h-11 items-center justify-center"
        >
          <Text className="font-sans-bold text-base text-brand-text underline">
            Use password
          </Text>
        </Pressable>

        <Button
          variant="outline"
          className="mt-1 w-full border-[1.5px]"
          textClassName="text-[17px]"
          onPress={close}
        >
          Cancel
        </Button>
      </View>
    </View>
  );
}
