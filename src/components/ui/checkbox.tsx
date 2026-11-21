import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "~/lib/utils/helpers";
import { SHADOWS, useThemeColors } from "~/lib/colors";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

// 24px box with an 8px radius. Checked: solid orange fill, rounded white tick
// and a soft orange glow. Unchecked: white field with a 1.5px border.
export function Checkbox({
  checked,
  onCheckedChange,
  className,
}: CheckboxProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={10}
      style={checked ? SHADOWS.glow : undefined}
      className={cn(
        "h-6 w-6 items-center justify-center rounded-checkbox",
        checked
          ? "border-[1.5px] border-primary bg-primary"
          : "border-[1.5px] border-control bg-field",
        className,
      )}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={16}
          color={colors["primary-foreground"]}
        />
      )}
    </Pressable>
  );
}
