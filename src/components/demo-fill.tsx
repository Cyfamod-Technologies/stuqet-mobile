import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { isDemoMode } from "~/demo/flag";
import { useThemeColors } from "~/lib/colors";

interface DemoFillProps {
  /** Fills the form with sample values. The chip only shows in demo mode. */
  onFill?: () => void;
  label?: string;
}

// "Fill with sample data" chip shown above the vendor forms in demo mode so
// every form can be walked through without typing. Renders nothing otherwise.
export function DemoFill({
  onFill,
  label = "Fill with sample data",
}: DemoFillProps) {
  const colors = useThemeColors();
  if (!isDemoMode || !onFill) return null;

  return (
    <Pressable
      onPress={onFill}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-10 flex-row items-center gap-2 self-start rounded-full border border-dashed border-primary bg-tint px-3.5"
    >
      <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
      <Text className="font-sans-semibold text-[13px] text-brand-text">
        {label}
      </Text>
    </Pressable>
  );
}
