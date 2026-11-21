import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";

interface OrderSearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
}

// 48px search box of the Orders board. The API has no search endpoint, so the
// text filters the orders already loaded (by order code or total).
export function OrderSearchField({
  value,
  onChangeText,
}: OrderSearchFieldProps) {
  const colors = useThemeColors();

  return (
    <View className="min-w-0 flex-1 justify-center">
      <View className="absolute left-[15px] z-10" pointerEvents="none">
        <Ionicons name="search" size={20} color={colors.hint} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search orders"
        placeholderTextColor={colors.hint}
        accessibilityLabel="Search orders by code or amount"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        style={SHADOWS.field}
        className="h-12 rounded-field border border-border bg-field pl-[46px] pr-11 font-sans-medium text-base text-foreground"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          className="absolute right-0 h-12 w-11 items-center justify-center"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colors["muted-foreground"]}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
