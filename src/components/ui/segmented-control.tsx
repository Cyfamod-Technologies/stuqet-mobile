import { View, Text, Pressable, ScrollView } from "react-native";
import { cn } from "~/lib/utils/helpers";

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

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  scrollable = false,
}: SegmentedControlProps) {
  const content = (
    <View
      className={cn("flex-row gap-1 rounded-field bg-secondary p-1", className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn(
              "flex-1 items-center rounded-xl px-3 py-2.5",
              isActive ? "bg-card" : "bg-transparent",
            )}
          >
            <Text
              className={cn(
                "font-sans-semibold text-sm",
                isActive ? "text-foreground" : "text-muted-foreground",
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
