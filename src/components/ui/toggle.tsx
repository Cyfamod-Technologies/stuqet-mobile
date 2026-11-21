import { Pressable, View } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { SHADOWS } from "~/lib/colors";

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

// Orange on-state switch used for Published, Cash on delivery, etc. Drawn to
// the board spec: 48x28 pill track (off `control`, on `primary`) with a 22px
// white thumb inset 3px; the touch area is padded to 44px.
export function Toggle({ value, onValueChange, disabled, label }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      className={cn(disabled && "opacity-50")}
    >
      <View
        className={cn(
          "h-7 w-12 justify-center rounded-pill px-[3px]",
          value ? "items-end bg-primary" : "items-start bg-control",
        )}
      >
        <View
          className="h-[22px] w-[22px] rounded-full bg-white"
          style={SHADOWS.thumb}
        />
      </View>
    </Pressable>
  );
}
