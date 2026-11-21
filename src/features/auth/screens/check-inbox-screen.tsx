import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { useVendorResendResetCode } from "~/features/auth/vendor-hooks";
import type { IdentifierMethod } from "~/features/auth/types";

// "Check your inbox" board, shown after POST /auth/password/forget_request.
export function CheckInboxScreen() {
  const params = useLocalSearchParams<{
    identifier?: string;
    method?: string;
  }>();
  const identifier = params.identifier ?? "";
  const method: IdentifierMethod =
    params.method === "phone" ? "phone" : "email";
  const { mutate: resend, isPending } = useVendorResendResetCode();

  const sentTo = identifier ? (
    <Text className="font-sans-bold text-[17px] text-foreground">
      {identifier}
    </Text>
  ) : (
    "you"
  );

  const openMailApp = async () => {
    try {
      await Linking.openURL("mailto:");
    } catch {
      // No mail app: nothing to open, the code is still in their inbox.
    }
  };

  return (
    <StatusLayout
      back
      onBack={() => router.replace("/(auth)/forgot-password")}
      hero={
        <StatusHero icon="mail-outline" size={140} core={92} iconSize={42} />
      }
      title="Check your inbox"
      body={
        <>
          We sent a 6-digit code to {sentTo}. Enter it on the next screen to
          choose a new password.
        </>
      }
      footer={
        <>
          <Button
            onPress={() =>
              router.push({
                pathname: "/(auth)/reset-password",
                params: { identifier, method },
              })
            }
          >
            Enter code
          </Button>
          {method === "email" ? (
            <Button
              variant="outline"
              textClassName="text-[17px]"
              onPress={openMailApp}
            >
              Open email app
            </Button>
          ) : null}
          <View className="flex-row flex-wrap items-center justify-center gap-x-1.5">
            <Text tone="muted" className="font-sans-medium text-[15px]">
              Didn&apos;t get it?
            </Text>
            <Pressable
              disabled={isPending || !identifier}
              onPress={() => resend({ identifier, method })}
              accessibilityRole="button"
              className="min-h-11 justify-center"
            >
              <Text className="font-sans-bold text-[15px] text-brand-text underline">
                {isPending ? "Sending..." : "Resend code"}
              </Text>
            </Pressable>
            <Text tone="muted" className="font-sans-medium text-[15px]">
              ·
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/forgot-password")}
              accessibilityRole="button"
              className="min-h-11 justify-center"
            >
              <Text className="font-sans-bold text-[15px] text-brand-text underline">
                {method === "phone" ? "Change number" : "Change email"}
              </Text>
            </Pressable>
          </View>
        </>
      }
    />
  );
}
