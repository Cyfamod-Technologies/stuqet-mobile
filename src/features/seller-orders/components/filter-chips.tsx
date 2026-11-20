import { Pressable, ScrollView } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

// Horizontal pill chips (order status filters, notification categories).
// Bleeds to the screen edges inside a 20px-padded screen.
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      className="-mx-5 flex-grow-0"
      contentContainerClassName="gap-2 px-5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value || "all"}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={cn(
              "h-10 justify-center rounded-full border px-4",
              active ? "border-tint-border bg-tint" : "border-border bg-field",
            )}
          >
            <Text
              className={cn(
                "text-sm",
                active
                  ? "font-sans-bold text-brand-text"
                  : "font-sans-semibold text-muted-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
