import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "~/components/screen";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { DividerLabel } from "~/components/ui/divider-label";
import { Text } from "~/components/ui/text";
import { SocialPill } from "~/features/auth/components/social-buttons";
import { isSocialLoginEnabled } from "~/lib/config/features";
import { ArtPanel, MiniCard } from "../components/intro-art";

// Welcome board: logo, illustration, "Order food from your campus.", Create
// account, Google / Apple and "Already have an account? Log in".
export function CustomerWelcomeScreen() {
  return (
    <Screen contentContainerStyle={{ gap: 18, flexGrow: 1 }}>
      <Logo variant="default" layout="inline" size="sm" />

      <ArtPanel className="h-[250px] items-center justify-center gap-2.5">
        <MiniCard icon="restaurant" rotate={-4} className="-ml-12" />
        <MiniCard icon="checkmark" tone="brand" rotate={3} className="ml-10" />
        <MiniCard icon="location" tone="dark" rotate={-3} className="-ml-6" />
        <View className="absolute bottom-6 right-6 h-3 w-3 rounded-full bg-primary" />
      </ArtPanel>

      <View className="gap-1.5">
        <Text
          accessibilityRole="header"
          className="font-sans-extrabold text-[32px] leading-[38px]"
        >
          Order food from your campus.
        </Text>
        <Text tone="muted" className="font-sans-medium text-base leading-6">
          Create an account to start ordering.
        </Text>
      </View>

      <View className="gap-3">
        <Button onPress={() => router.push("/(auth)/create-account")}>
          Create account
        </Button>
        {isSocialLoginEnabled ? (
          <>
            <DividerLabel />
            <SocialPill provider="google" />
            <SocialPill provider="apple" />
          </>
        ) : null}
      </View>

      <View className="mt-auto flex-row flex-wrap items-center justify-center pt-2">
        <Text tone="muted" className="font-sans-medium text-[15px]">
          Already have an account?{" "}
        </Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          accessibilityRole="link"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            Log in
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
