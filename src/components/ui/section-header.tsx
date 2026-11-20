import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="heading" className="text-[19px]">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="link" className="underline">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
