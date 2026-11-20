import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Empty and error placeholder for lists (no results, failed to load + retry).
export function EmptyState({
  icon = "file-tray-outline",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View className="items-center gap-3 px-6 py-12">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-tint">
        <Ionicons name={icon} size={34} color={colors["brand-text"]} />
      </View>
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text tone="muted" className="text-center">
          {message}
        </Text>
      ) : null}
      {actionLabel ? (
        <Button variant="soft" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
