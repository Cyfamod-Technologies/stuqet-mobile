import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { StatusHero } from "~/features/auth/components/status-hero";
import { useThemeColors } from "~/lib/colors";
import { notifyInfo } from "~/lib/utils/toast";
import { SetupHeader } from "../components/setup-header";

const EXAMPLES: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}[] = [
  { icon: "checkmark", label: "Your order is confirmed" },
  { icon: "bicycle-outline", label: "Your order is on the way" },
  { icon: "chatbubble-outline", label: "A seller replied to you" },
];

// Set up 4 · Notifications. TODO: ask the system for permission once
// expo-notifications is added; for now Allow only moves on.
export function NotificationsStepScreen() {
  const colors = useThemeColors();
  const next = () => router.push("/setup/fingerprint");

  return (
    <View className="flex-1">
      <Screen contentContainerStyle={{ gap: 18 }}>
        <SetupHeader step={4} total={4} label="Notifications" />
        <View className="items-center gap-3 pt-4">
          <StatusHero icon="notifications" size={140} core={80} iconSize={36} />
          <Text
            accessibilityRole="header"
            className="mt-3 text-center font-sans-extrabold text-[32px] leading-[38px]"
          >
            Stay on top of your orders
          </Text>
          <Text
            tone="muted"
            className="text-center font-sans-medium text-base leading-6"
          >
            Get a heads-up when something changes.
          </Text>
        </View>
        <Card className="overflow-hidden p-0">
          {EXAMPLES.map((item, index) => (
            <View
              key={item.label}
              className={`min-h-14 flex-row items-center gap-3 px-4 py-2.5 ${index < EXAMPLES.length - 1 ? "border-b border-divider" : ""}`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-tint">
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={colors["brand-text"]}
                />
              </View>
              <Text className="font-sans-bold text-[15px]">{item.label}</Text>
            </View>
          ))}
        </Card>
      </Screen>
      <SetupFooter>
        <Button
          onPress={() => {
            notifyInfo({ message: "Notifications are on" });
            next();
          }}
        >
          Allow notifications
        </Button>
        <Button
          variant="ghost"
          textClassName="text-[17px] text-brand-text underline"
          onPress={next}
        >
          Not now
        </Button>
      </SetupFooter>
    </View>
  );
}
