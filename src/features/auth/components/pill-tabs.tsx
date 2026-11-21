import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";

interface PillTabOption<T extends string> {
  label: string;
  value: T;
}

interface PillTabsProps<T extends string> {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

// The Email | Phone switch from the login and forgot-password boards: a 48px
// pill track with a white active segment. (The shared SegmentedControl uses a
// 14px radius, so the auth screens use this one.)
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: PillTabsProps<T>) {
  return (
    <View className="h-12 flex-row gap-1 rounded-full bg-secondary p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={cn(
              "flex-1 items-center justify-center rounded-full",
              active && "bg-card shadow-sm",
            )}
          >
            <Text
              className={cn(
                "text-[15px]",
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
