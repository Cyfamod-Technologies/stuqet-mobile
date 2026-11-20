import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface ListRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  /** Replaces the trailing chevron (badge, switch…). */
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
}

// Settings-style row: tinted icon tile, title, optional subtitle, chevron.
// Rows live inside a <Card className="p-0 overflow-hidden">.
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  last,
  danger,
}: ListRowProps) {
  const colors = useThemeColors();
  const tint = danger ? colors["destructive-text"] : colors["brand-text"];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      className={cn(
        "min-h-16 flex-row items-center gap-3.5 px-4 py-2.5 active:bg-muted",
        !last && "border-b border-border",
      )}
    >
      <View
        className={cn(
          "h-10 w-10 items-center justify-center rounded-2xl",
          danger ? "bg-destructive-tint" : "bg-tint",
        )}
      >
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <View className="flex-1">
        <Text
          variant="heading"
          className={cn("text-base", danger && "text-destructive-text")}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" className="text-[13px] leading-[18px]">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right !== undefined ? (
        right
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color={colors.hint} />
      ) : null}
    </Pressable>
  );
}
