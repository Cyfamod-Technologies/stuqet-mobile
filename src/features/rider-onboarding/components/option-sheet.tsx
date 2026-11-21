import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

interface OptionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  /** Shows a search field that filters the options (the school list). */
  searchable?: boolean;
  onSearch?: (text: string) => void;
  loading?: boolean;
}

// List sheet for "School you deliver at" and "Area you cover": an optional
// search field and one radio row per option; picking one closes the sheet.
export function OptionSheet({
  visible,
  onClose,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  searchable,
  onSearch,
  loading,
}: OptionSheetProps) {
  const colors = useThemeColors();
  const [text, setText] = useState("");

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
    >
      {searchable ? (
        <Input
          value={text}
          onChangeText={(t) => {
            setText(t);
            onSearch?.(t);
          }}
          placeholder="Search schools"
          autoCorrect={false}
          startAdornment={
            <Ionicons name="search" size={20} color={colors.hint} />
          }
        />
      ) : null}
      <ScrollView
        style={{ maxHeight: 320 }}
        keyboardShouldPersistTaps="handled"
      >
        {options.length === 0 ? (
          <Text tone="muted" className="py-6 text-center">
            {loading ? "Loading…" : "Nothing found"}
          </Text>
        ) : (
          options.map((option) => {
            const active = option === selected;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className="min-h-14 flex-row items-center gap-3 border-b border-divider py-2.5 active:bg-muted"
              >
                <Text
                  className={cn(
                    "flex-1 font-sans-bold text-base",
                    active && "text-brand-text",
                  )}
                >
                  {option}
                </Text>
                {active ? (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors["brand-text"]}
                  />
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </BottomSheet>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  error?: string;
}

// A field that opens a sheet instead of a keyboard (boards: School / Area).
export function SelectRow({
  label,
  value,
  placeholder,
  icon,
  onPress,
  error,
}: SelectRowProps) {
  const colors = useThemeColors();
  return (
    <View className="gap-1.5">
      <Text className="font-sans-semibold text-sm leading-[18px]">{label}</Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        className={cn(
          "min-h-field flex-row items-center gap-2.5 rounded-field border bg-field px-4 active:opacity-90",
          error ? "border-[1.5px] border-destructive-text" : "border-border",
        )}
      >
        <Ionicons name={icon} size={20} color={colors.hint} />
        <Text
          className={cn(
            "flex-1 font-sans-medium text-base",
            !value && "text-hint",
          )}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={colors["muted-foreground"]}
        />
      </Pressable>
      {error ? (
        <Text className="font-sans-semibold text-[13px] text-destructive-text">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
