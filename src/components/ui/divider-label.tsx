import { View } from "react-native";
import { Text } from "~/components/ui/text";

// The "—— Or ——" separator between the primary action and social sign-in.
export function DividerLabel({ label = "Or" }: { label?: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border" />
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
