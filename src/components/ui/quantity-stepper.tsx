import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { Text } from "~/components/ui/text";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Disables both buttons (a request is in flight). */
  disabled?: boolean;
}

// Round − / + buttons around the count (Cart, Dish): the minus is a white
// outlined circle, the plus a brand tint circle. 44px touch targets.
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  disabled,
}: QuantityStepperProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-1">
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className="h-11 w-11 items-center justify-center"
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-field"
          style={{ opacity: disabled || value <= min ? 0.45 : 1 }}
        >
          <Ionicons name="remove" size={18} color={colors.foreground} />
        </View>
      </Pressable>
      <Text
        accessibilityLabel={`Quantity ${value}`}
        className="min-w-6 text-center font-sans-bold text-base"
      >
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className="h-11 w-11 items-center justify-center"
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-full border border-tint-border bg-tint"
          style={{ opacity: disabled || value >= max ? 0.45 : 1 }}
        >
          <Ionicons name="add" size={18} color={colors["brand-text"]} />
        </View>
      </Pressable>
    </View>
  );
}
