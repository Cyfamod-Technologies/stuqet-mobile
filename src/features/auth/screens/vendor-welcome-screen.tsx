import { useState, type ComponentProps } from "react";
import { Pressable, View, type DimensionValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Screen } from "~/components/screen";
import { Button } from "~/components/ui/button";
import { DividerLabel } from "~/components/ui/divider-label";
import { Text } from "~/components/ui/text";
import { VendorLockup } from "~/features/auth/components/brand-mark";
import { SocialPill } from "~/features/auth/components/social-buttons";
import { openWebRegistration } from "~/features/auth/registration";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { isSocialLoginEnabled } from "~/lib/config/features";
import { cn } from "~/lib/utils/helpers";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Card 3 (top 200 + height 80) needs this much room to avoid being cut off.
const FULL_ILLUSTRATION_HEIGHT = 290;

interface FloatingCardProps {
  rotate: string;
  className: string;
  width: DimensionValue;
  height: number;
  tone: "light" | "brand" | "dark";
  icon: IconName;
  round?: boolean;
}

function FloatingCard({
  rotate,
  className,
  width,
  height,
  tone,
  icon,
  round,
}: FloatingCardProps) {
  const colors = useThemeColors();

  const card = {
    light: "bg-card",
    brand: "bg-primary",
    dark: "bg-foreground",
  }[tone];
  const tile = {
    light: "bg-tint",
    brand: "bg-primary-foreground",
    dark: "bg-background/15",
  }[tone];
  const iconColor = {
    light: colors["brand-text"],
    brand: colors.primary,
    dark: colors.background,
  }[tone];
  const barA = {
    light: "bg-border",
    brand: "bg-primary-foreground/95",
    dark: "bg-background/35",
  }[tone];
  const barB = {
    light: "bg-secondary",
    brand: "bg-primary-foreground/55",
    dark: "bg-background/20",
  }[tone];

  return (
    <View
      style={[
        { width, height, transform: [{ rotate }] },
        tone === "brand" ? SHADOWS.button : SHADOWS.field,
      ]}
      className={cn(
        "absolute flex-row items-center gap-3.5 rounded-[24px] px-4",
        card,
        className,
      )}
    >
      <View
        className={cn(
          "h-[42px] w-[42px] items-center justify-center",
          round ? "rounded-full" : "rounded-[14px]",
          tile,
        )}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1 gap-[9px]">
        <View className={cn("h-2.5 w-[104px] rounded-full", barA)} />
        <View className={cn("h-2.5 w-16 rounded-full", barB)} />
      </View>
    </View>
  );
}

// Welcome board: lockup, floating-cards illustration, pitch, "Create a shop"
// (opens the web registration: the backend has no seller registration API),
// full-width Google / Apple, and "Already have an account? Log in".
export function VendorWelcomeScreen() {
  const [roomForAll, setRoomForAll] = useState(true);

  return (
    <View className="flex-1">
      <Screen
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, gap: 0 }}
      >
        <VendorLockup />

        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onLayout={(e) =>
            setRoomForAll(
              e.nativeEvent.layout.height >= FULL_ILLUSTRATION_HEIGHT,
            )
          }
          className="mt-4 min-h-[220px] flex-1 overflow-hidden rounded-[40px] bg-tint"
        >
          <View className="bg-tint-border/60 absolute -right-[60px] -top-[60px] h-[190px] w-[190px] rounded-full" />
          <View className="bg-tint-border/60 absolute -bottom-[70px] -left-[50px] h-[180px] w-[180px] rounded-full" />
          <View className="absolute bottom-9 right-10 h-3 w-3 rounded-full bg-primary" />
          <View className="absolute left-9 top-10 h-[9px] w-[9px] rounded-full bg-tint-border" />

          <FloatingCard
            tone="light"
            icon="bag-handle-outline"
            rotate="-5deg"
            width={214}
            height={88}
            className="left-5 top-[30px]"
          />
          <FloatingCard
            tone="brand"
            icon="checkmark"
            round
            rotate="4deg"
            width={214}
            height={88}
            className="right-4 top-[112px]"
          />
          {roomForAll ? (
            <FloatingCard
              tone="dark"
              icon="cash-outline"
              rotate="-3deg"
              width={200}
              height={80}
              className="left-[30px] top-[200px]"
            />
          ) : null}
        </View>

        <Text
          accessibilityRole="header"
          className="mb-1.5 mt-5 font-sans-extrabold text-[32px] leading-[38px]"
          style={{ letterSpacing: -0.6 }}
        >
          Run your shop from your pocket.
        </Text>
        <Text
          tone="muted"
          className="mb-[18px] font-sans-medium text-[17px] leading-6"
        >
          Manage orders, products and payouts for your Stuqet shop.
        </Text>

        <Button onPress={openWebRegistration}>Create a shop</Button>

        {isSocialLoginEnabled ? (
          <>
            <View className="my-3.5">
              <DividerLabel />
            </View>
            <View className="gap-2.5">
              <SocialPill provider="google" />
              <SocialPill provider="apple" />
            </View>
          </>
        ) : null}

        <View className="mt-3.5 flex-row flex-wrap items-center justify-center">
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
    </View>
  );
}
