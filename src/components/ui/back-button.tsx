import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SHADOWS, useThemeColors } from "~/lib/colors";

interface BackButtonProps {
  /** Defaults to `router.back()`. */
  onPress?: () => void;
}

// 44px round white button with a chevron — top-left of every pushed screen.
export function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={SHADOWS.field}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-field active:opacity-80"
    >
      <Ionicons name="chevron-back" size={22} color={colors.foreground} />
    </Pressable>
  );
}
