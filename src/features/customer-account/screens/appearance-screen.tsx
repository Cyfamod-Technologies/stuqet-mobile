import { ScrollView, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "~/components/ui/back-button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { isThemeSwitchEnabled } from "~/lib/config/features";
import { useThemeStore, type ThemePreference } from "~/lib/stores/theme-store";
import { cn } from "~/lib/utils/helpers";

const OPTIONS: { value: ThemePreference; title: string; subtitle: string }[] = [
  { value: "light", title: "Light", subtitle: "Always use the light theme" },
  { value: "dark", title: "Dark", subtitle: "Always use the dark theme" },
  {
    value: "system",
    title: "Match my phone",
    subtitle: "Follow the system setting",
  },
];

// Appearance board (shared by customers and riders): Light, Dark or Match my
// phone as radio rows.
export function AppearanceScreen() {
  const insets = useSafeAreaInsets();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      <View className="flex-row items-center gap-3">
        <BackButton />
        <Text variant="headerTitle" className="flex-1 text-center">
          Appearance
        </Text>
        <View className="w-11" />
      </View>
      {isThemeSwitchEnabled ? (
        <Card className="overflow-hidden p-0">
          {OPTIONS.map((option, index) => {
            const selected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={cn(
                  "min-h-16 flex-row items-center gap-3 px-4 py-2.5 active:bg-muted",
                  index < OPTIONS.length - 1 && "border-b border-divider",
                )}
              >
                <View className="min-w-0 flex-1">
                  <Text variant="heading" className="text-base leading-[22px]">
                    {option.title}
                  </Text>
                  <Text variant="meta">{option.subtitle}</Text>
                </View>
                <View
                  className={cn(
                    "h-6 w-6 items-center justify-center rounded-full border-[1.5px]",
                    selected ? "border-primary" : "border-control",
                  )}
                >
                  {selected ? (
                    <View className="h-3 w-3 rounded-full bg-primary" />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </Card>
      ) : (
        <Text tone="muted">The theme is fixed in this build.</Text>
      )}
    </ScrollView>
  );
}
