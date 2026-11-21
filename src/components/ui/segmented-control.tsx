import { View, Text, Pressable, ScrollView } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { SHADOWS } from "~/lib/colors";

export interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  scrollable?: boolean;
}

// Pill segmented control (boards: Login Email/Phone, Money tabs, Availability):
// a 48px pill track (`secondary`) with 4px padding and 4px gaps; the selected
// segment is a white (`pill`) pill with a soft shadow and a 15px bold label,
// the others 15px semibold muted. Labels drop to 14px with three or more
// options. Each segment is at least 40px tall inside the 48px track.
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  scrollable = false,
}: SegmentedControlProps) {
  const compact = options.length >= 3;
  const content = (
    <View
      accessibilityRole="tablist"
      className={cn(
        "h-12 flex-row gap-1 rounded-pill bg-secondary p-1",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={isActive ? SHADOWS.pill : undefined}
            className={cn(
              "items-center justify-center rounded-pill px-3",
              scrollable ? "px-5" : "flex-1",
              isActive ? "bg-pill" : "bg-transparent",
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                compact ? "text-sm" : "text-[15px]",
                isActive
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

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return content;
}
