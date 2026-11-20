import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Pill (filters, options) or rounded square (weekdays). */
  shape?: "pill" | "square";
  /** Taller chip with a larger label (form options). */
  large?: boolean;
  /** Tick on the left when selected. */
  check?: boolean;
  /** Share the row width equally (weekday row). */
  grow?: boolean;
  accessibilityLabel?: string;
  /** "checkbox" for multi-select, "button" for single choice. */
  role?: "button" | "checkbox";
}

// Selectable chip: tinted + brand text when on, white + muted text when off.
export function Chip({
  label,
  selected,
  onPress,
  shape = "pill",
  large,
  check,
  grow,
  accessibilityLabel,
  role = "button",
}: ChipProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={
        role === "checkbox" ? { checked: selected } : { selected }
      }
      className={cn(
        "flex-row items-center justify-center gap-1.5 border",
        shape === "pill" ? "rounded-full px-4" : "rounded-[14px] px-0",
        large || shape === "square" ? "h-11" : "h-10",
        grow && "flex-1",
        selected
          ? "border-tint-border bg-tint"
          : "border-border bg-field",
      )}
    >
      {check && selected ? (
        <Ionicons name="checkmark" size={16} color={colors["brand-text"]} />
      ) : null}
      <Text
        className={cn(
          shape === "square"
            ? "text-[13px]"
            : large
              ? "text-[15px]"
              : "text-sm",
          selected
            ? "font-sans-bold text-brand-text"
            : "font-sans-semibold text-muted-foreground",
          shape === "square" && selected && "font-sans-extrabold",
        )}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
