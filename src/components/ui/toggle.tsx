import { Switch } from "react-native";
import { useThemeColors } from "~/lib/colors";

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

// Orange on-state switch used for Published, Cash on delivery, etc.
export function Toggle({ value, onValueChange, disabled, label }: ToggleProps) {
  const colors = useThemeColors();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={label}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.border}
    />
  );
}
