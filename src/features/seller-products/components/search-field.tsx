import { Platform, Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}

// The catalogue search box: 48px tall (the form fields are 52), 14px radius,
// search icon inside on the left, clear button on the right while typing.
export function SearchField({
  value,
  onChangeText,
  placeholder,
}: SearchFieldProps) {
  const colors = useThemeColors();

  return (
    <View
      style={SHADOWS.field}
      className="h-12 flex-row items-center gap-[11px] rounded-field border border-border bg-field px-[15px]"
    >
      <Ionicons name="search" size={20} color={colors["muted-foreground"]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.hint}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        className="flex-1 py-0 font-sans-medium text-foreground"
        style={{
          fontSize: 16,
          ...(Platform.OS === "ios" ? { lineHeight: 20 } : {}),
        }}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={20} color={colors.hint} />
        </Pressable>
      ) : null}
    </View>
  );
}
