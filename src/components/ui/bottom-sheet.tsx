import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Text } from "~/components/ui/text";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// Modal sheet: dimmed backdrop (tap to close), grabber, title and a close
// button. Used for the status picker and the "what do you want to add" chooser.
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
          className="absolute inset-0 bg-black/50"
        />
        <View
          className="gap-3.5 rounded-t-[28px] bg-background px-5 pt-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 12 }}
        >
          <View className="h-1.5 w-11 self-center rounded-full bg-border" />
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text variant="title">{title}</Text>
              {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
            </View>
            <RoundIconButton icon="close" label="Close" onPress={onClose} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
