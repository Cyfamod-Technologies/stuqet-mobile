import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";

export interface QuickAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}

// 2-column grid of white action tiles (icon over label).
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const colors = useThemeColors();
  const rows: QuickAction[][] = [];
  for (let i = 0; i < actions.length; i += 2) {
    rows.push(actions.slice(i, i + 2));
  }

  return (
    <View className="gap-2.5">
      {rows.map((row) => (
        <View key={row[0].label} className="flex-row gap-2.5">
          {row.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={SHADOWS.field}
              className="min-h-[76px] flex-1 justify-center gap-2 rounded-[20px] border border-border bg-card px-3.5 py-3 active:opacity-90"
            >
              <Ionicons
                name={action.icon}
                size={22}
                color={colors["brand-text"]}
              />
              <Text className="font-sans-bold text-[15px] leading-[18px]">
                {action.label}
              </Text>
            </Pressable>
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
