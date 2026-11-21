import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

interface ChoiceFieldProps {
  label: string;
  options: string[];
  /** Radio group (one value) or checkbox group (several). */
  multiple: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

// Radio / multi-select question from the admin's verification form.
export function ChoiceField({
  label,
  options,
  multiple,
  value,
  onChange,
  error,
}: ChoiceFieldProps) {
  const colors = useThemeColors();

  const toggle = (option: string) => {
    if (!multiple) return onChange([option]);
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  };

  return (
    <View className="gap-1.5">
      <Text variant="label">{label}</Text>
      <View
        accessibilityRole={multiple ? undefined : "radiogroup"}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        {options.map((option, index) => {
          const selected = value.includes(option);
          const icon = multiple
            ? selected
              ? "checkbox"
              : "square-outline"
            : selected
              ? "radio-button-on"
              : "radio-button-off";
          return (
            <Pressable
              key={option}
              onPress={() => toggle(option)}
              accessibilityRole={multiple ? "checkbox" : "radio"}
              accessibilityState={{ checked: selected }}
              className={cn(
                "min-h-12 flex-row items-center gap-3 px-4 py-2.5 active:bg-muted",
                index < options.length - 1 && "border-b border-border",
              )}
            >
              <Ionicons
                name={icon}
                size={22}
                color={selected ? colors.primary : colors.hint}
              />
              <Text variant="label" className="flex-1 text-base">
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" tone="error" className="font-sans-medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
