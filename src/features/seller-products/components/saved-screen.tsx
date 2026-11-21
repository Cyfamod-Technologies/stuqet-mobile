import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Text } from "~/components/ui/text";

interface SavedScreenProps {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

// "Saved" confirmation shared by the item and service forms. Unlike a form
// screen, its buttons sit directly on the page (no white action bar).
export function SavedScreen({
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: SavedScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center gap-[18px] px-6">
        <HeroBadge icon="checkmark" tone="success" />
        <Text
          variant="display"
          className="text-center text-[30px] leading-9"
          accessibilityRole="header"
        >
          Saved
        </Text>
        <Text
          tone="muted"
          className="max-w-[310px] text-center font-sans-medium text-[17px] leading-6"
        >
          {message}
        </Text>
      </View>
      <View
        className="gap-2.5 px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 16 }}
      >
        <Button onPress={onPrimary}>{primaryLabel}</Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[52px] px-6"
          textClassName="text-[17px]"
          onPress={onSecondary}
        >
          {secondaryLabel}
        </Button>
      </View>
    </View>
  );
}
