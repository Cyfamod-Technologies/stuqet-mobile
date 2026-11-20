import { Pressable, View } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface OptionRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  last?: boolean;
  disabled?: boolean;
}

// Radio row used inside bottom sheets (delivery status, payment filter).
export function OptionRow({
  label,
  selected,
  onPress,
  last,
  disabled,
}: OptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      className={cn(
        "min-h-[52px] flex-row items-center gap-3.5 px-1 py-1.5",
        !last && "border-b border-border",
        disabled && "opacity-50",
      )}
    >
      <View
        className={cn(
          "h-[22px] w-[22px] items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-hint",
        )}
      >
        {selected ? <View className="h-3 w-3 rounded-full bg-primary" /> : null}
      </View>
      <Text
        className={cn(
          "flex-1 text-base",
          selected ? "font-sans-extrabold" : "font-sans-semibold",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
