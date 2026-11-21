import { Pressable } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

// Outlined filter pill (boards: category chips on Home, Delivery / Pickup /
// Under ₦3,000 on Search, status filters on Deliveries): 40px tall, white with
// a hairline border; selected = brand tint with a brand border. This is not
// the SegmentedControl, which is one track with a sliding white segment.
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      className={cn(
        "h-10 justify-center rounded-full border px-4 active:opacity-80",
        selected ? "border-primary bg-tint" : "border-border bg-field",
      )}
    >
      <Text
        numberOfLines={1}
        className={cn(
          "text-sm",
          selected
            ? "font-sans-bold text-brand-text"
            : "font-sans-semibold text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
