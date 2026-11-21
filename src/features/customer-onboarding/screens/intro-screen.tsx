import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { ArtPanel, LabelCard, MiniCard } from "../components/intro-art";

interface Slide {
  title: string;
  body: string;
  action: string;
}

const SLIDES: Slide[] = [
  {
    title: "Food from your campus",
    body: "Order from food vendors at your school and see what is available near you.",
    action: "Next",
  },
  {
    title: "Meals, snacks and drinks",
    body: "Order a meal, a snack or a drink for delivery or pickup, all from one app.",
    action: "Next",
  },
  {
    title: "Track every order",
    body: "Follow your order from confirmed to delivered, and message the seller if you need to.",
    action: "Get started",
  },
];

function Art({ index }: { index: number }) {
  const colors = useThemeColors();

  if (index === 0) {
    return (
      <ArtPanel className="flex-1 items-center justify-center gap-3">
        <View
          style={SHADOWS.field}
          className="absolute top-8 flex-row items-center gap-2 rounded-full bg-card px-3.5 py-2"
        >
          <Ionicons
            name="school-outline"
            size={16}
            color={colors["brand-text"]}
          />
          <Text className="font-sans-bold text-[13px]">Your school</Text>
        </View>
        <View className="mt-14 gap-3">
          <MiniCard icon="restaurant" rotate={-4} className="-ml-8" />
          <MiniCard
            icon="cafe-outline"
            tone="brand"
            rotate={3}
            className="ml-10"
          />
          <MiniCard
            icon="fast-food-outline"
            tone="dark"
            rotate={-2}
            className="-ml-4"
          />
        </View>
      </ArtPanel>
    );
  }
  if (index === 1) {
    return (
      <ArtPanel className="flex-1 items-center justify-center gap-3">
        <LabelCard
          icon="restaurant"
          label="Meals"
          rotate={-4}
          className="-ml-10"
        />
        <LabelCard
          icon="ice-cream-outline"
          label="Snacks"
          rotate={3}
          className="ml-8"
        />
        <LabelCard
          icon="beer-outline"
          label="Drinks"
          tone="dark"
          rotate={-3}
          className="-ml-6"
        />
        <View
          style={SHADOWS.field}
          className="absolute bottom-8 right-6 flex-row items-center gap-1.5 rounded-full bg-card px-3 py-2"
        >
          <Ionicons
            name="bicycle-outline"
            size={16}
            color={colors["brand-text"]}
          />
          <Text className="font-sans-bold text-xs">Delivery or pickup</Text>
        </View>
      </ArtPanel>
    );
  }
  const steps = [
    { label: "Confirmed", done: true },
    { label: "Picked up", done: true },
    { label: "On the way", done: false, now: true },
    { label: "Delivered", done: false },
  ];
  return (
    <ArtPanel className="flex-1 items-center justify-center">
      <View
        style={SHADOWS.field}
        className="w-60 gap-3.5 rounded-3xl bg-card p-5"
      >
        {steps.map((step) => (
          <View key={step.label} className="flex-row items-center gap-3">
            <View
              className={cn(
                "h-5 w-5 items-center justify-center rounded-full",
                step.done
                  ? "bg-success"
                  : step.now
                    ? "border-2 border-primary"
                    : "bg-secondary",
              )}
            >
              {step.done ? (
                <Ionicons name="checkmark" size={12} color={colors.card} />
              ) : null}
            </View>
            <Text
              className={cn(
                "font-sans-bold text-[15px]",
                !step.done && !step.now && "text-muted-foreground",
              )}
            >
              {step.label}
            </Text>
            {step.now ? (
              <View className="rounded-md bg-secondary px-1.5 py-0.5">
                <Text className="font-sans-bold text-[10px] tracking-wider">
                  NOW
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
      <View
        style={SHADOWS.button}
        className="absolute bottom-8 flex-row items-center gap-2 rounded-full bg-primary px-4 py-2.5"
      >
        <Ionicons
          name="chatbubble-outline"
          size={16}
          color={colors["primary-foreground"]}
        />
        <Text className="font-sans-bold text-[13px] text-primary-foreground">
          Message the seller
        </Text>
      </View>
    </ArtPanel>
  );
}

// Intro slides (boards Intro 1 to 3): illustration, title, body, three dots and
// Next / Get started. Skip jumps to the welcome screen.
export function IntroScreen() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;
  const goWelcome = () => router.replace("/(auth)/welcome");

  return (
    <Screen scroll={false} contentContainerStyle={{ gap: 20 }}>
      <View className="flex-row justify-end">
        <Pressable
          onPress={goWelcome}
          accessibilityRole="button"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            Skip
          </Text>
        </Pressable>
      </View>

      <Art index={index} />

      <View className="gap-2">
        <Text
          accessibilityRole="header"
          className="font-sans-extrabold text-[32px] leading-[38px]"
        >
          {slide.title}
        </Text>
        <Text tone="muted" className="font-sans-medium text-base leading-6">
          {slide.body}
        </Text>
      </View>

      <View
        className="flex-row items-center justify-center gap-1.5"
        accessibilityElementsHidden
      >
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={cn(
              "h-1.5 rounded-full",
              i === index ? "w-7 bg-primary" : "w-1.5 bg-border-strong",
            )}
          />
        ))}
      </View>

      <Button onPress={last ? goWelcome : () => setIndex(index + 1)}>
        {slide.action}
      </Button>
    </Screen>
  );
}
