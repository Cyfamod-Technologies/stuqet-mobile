import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import type { PickedFile } from "../types";

interface FileFieldProps {
  label: string;
  value: PickedFile | null;
  error?: string;
  onPress: () => void;
}

// Dashed upload tile from the Verification design. Photos only for now (no
// document picker is installed), hence the "JPG or PNG" hint.
export function FileField({ label, value, error, onPress }: FileFieldProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-1.5">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `${label}: ${value.name}. Change file` : `Upload ${label}`
        }
        className={cn(
          "min-h-[76px] flex-row items-center gap-3.5 rounded-[18px] border-[1.5px] border-dashed bg-tint px-4 py-3 active:opacity-80",
          error ? "border-destructive" : "border-tint-border",
        )}
      >
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-card">
          <Ionicons
            name={value ? "checkmark-circle" : "cloud-upload-outline"}
            size={22}
            color={value ? colors.success : colors["brand-text"]}
          />
        </View>
        <View className="flex-1 gap-0.5">
          <Text variant="heading" className="text-[15px]">
            {label}
          </Text>
          <Text variant="caption" className="text-[13px]" numberOfLines={1}>
            {value ? `${value.name} · Tap to change` : "Photo, JPG or PNG"}
          </Text>
        </View>
      </Pressable>
      {error ? (
        <Text variant="caption" tone="error" className="font-sans-medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
