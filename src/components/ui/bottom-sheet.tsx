import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SHADOWS } from "~/lib/colors";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Text } from "~/components/ui/text";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// Modal sheet (boards): rgba(27,19,12,.5) scrim (tap to close), white surface
// with a 28px top radius, 44x5 grabber, 22/28 extrabold title and a 44px round
// close button. Used for pickers, filters and the "what do you want to add"
// chooser.
export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(27,19,12,0.5)" }}
        />
        <View
          className="gap-3 rounded-t-sheet bg-card px-5 pt-2.5"
          style={[
            SHADOWS.sheet,
            { paddingBottom: Math.max(insets.bottom, 12) + 12 },
          ]}
        >
          <View className="h-[5px] w-11 self-center rounded-full bg-border" />
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text variant="sheetTitle">{title}</Text>
              {subtitle ? (
                <Text
                  tone="muted"
                  className="font-sans-medium text-[15px] leading-5"
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <RoundIconButton icon="close" label="Close" onPress={onClose} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
