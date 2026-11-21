import { Pressable, View } from "react-native";
import { SHADOWS } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

export interface PillSegmentOption<T extends string> {
  value: T;
  label: string;
}

interface PillSegmentedControlProps<T extends string> {
  options: readonly PillSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "lg" is the Products | Food switch (15px label), "md" the form toggles. */
  size?: "md" | "lg";
  accessibilityLabel?: string;
}

// Shadow of the active pill: 0 1px 3px, 12% (a tighter variant of SHADOWS.field).
const ACTIVE_SHADOW = {
  ...SHADOWS.field,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.12,
  shadowRadius: 3,
  elevation: 1,
};

// The catalogue boards' segmented control: a 48px pill track with 4px padding
// and an active white 40px pill that carries the shadow. (The shared
// SegmentedControl is a rounded rectangle, so the boards get their own.)
export function PillSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  accessibilityLabel,
}: PillSegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="h-12 flex-row gap-1 rounded-full bg-secondary p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            style={active ? ACTIVE_SHADOW : undefined}
            className={cn(
              "h-10 flex-1 items-center justify-center rounded-full px-2",
              active ? "bg-card" : "bg-transparent",
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                size === "lg" ? "text-[15px]" : "text-sm",
                active
                  ? "font-sans-bold text-foreground"
                  : "font-sans-semibold text-muted-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
