import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";

interface RoundIconButtonProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
  /** Small orange dot (unread notifications). */
  dot?: boolean;
}

// 44px white round button — header actions (notifications, export, filters).
export function RoundIconButton({
  icon,
  label,
  onPress,
  dot,
}: RoundIconButtonProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={SHADOWS.field}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-field active:opacity-80"
    >
      <Ionicons name={icon} size={20} color={colors.foreground} />
      {dot ? (
        <View className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-field bg-primary" />
      ) : null}
    </Pressable>
  );
}
