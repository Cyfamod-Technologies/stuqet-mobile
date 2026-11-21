import { useState, type ComponentProps } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface PickerOption {
  label: string;
  value: string;
}

interface PickerFieldProps {
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Sheet title (defaults to the field label). */
  sheetTitle?: string;
  /** Left icon inside the field. */
  icon?: IconName;
  error?: string;
}

// A "select" drawn as a field that opens a bottom sheet (Company type, bank
// name). Lists are scrollable so 25 banks fit the same sheet as 4 company types.
export function PickerField({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Choose an option",
  sheetTitle,
  icon,
  error,
}: PickerFieldProps) {
  const colors = useThemeColors();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="gap-1.5">
      <Text variant="label">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        style={SHADOWS.field}
        className={cn(
          "min-h-field flex-row items-center gap-2.5 rounded-field border bg-field px-4",
          error ? "border-destructive" : "border-border",
          open && "border-primary",
        )}
      >
        {icon ? <Ionicons name={icon} size={20} color={colors.hint} /> : null}
        <Text
          numberOfLines={1}
          className={cn(
            "min-w-0 flex-1 font-sans-medium text-base",
            !selected && "text-hint",
          )}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors["muted-foreground"]}
        />
      </Pressable>
      {error ? (
        <Text variant="caption" tone="error" className="font-sans-medium">
          {error}
        </Text>
      ) : null}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={sheetTitle ?? label}
      >
        <ScrollView
          style={{ maxHeight: height * 0.5 }}
          keyboardShouldPersistTaps="handled"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                className={cn(
                  "min-h-[52px] flex-row items-center gap-3 px-1 py-1.5 active:opacity-70",
                  index < options.length - 1 && "border-b border-border",
                )}
              >
                <Text
                  numberOfLines={2}
                  className={cn(
                    "min-w-0 flex-1 text-base leading-[22px]",
                    isSelected ? "font-sans-extrabold" : "font-sans-semibold",
                  )}
                >
                  {option.label}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark" size={22} color={colors.primary} />
                ) : (
                  <View className="h-[22px] w-[22px]" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
