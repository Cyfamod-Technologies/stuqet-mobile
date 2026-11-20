import type { ReactNode } from "react";
import { View } from "react-native";
import { BackButton } from "~/components/ui/back-button";
import { Text } from "~/components/ui/text";

interface ScreenHeaderProps {
  title: string;
  /** Show the round back button (pushed screens). */
  back?: boolean;
  onBack?: () => void;
  /** Right-aligned actions (use 44px round buttons). */
  right?: ReactNode;
  /** Optional line under a root-tab title. */
  subtitle?: string;
}

// Pushed screens: [back] centred title [right]. Root tabs (no `back`): large
// left-aligned title with actions on the right.
export function ScreenHeader({
  title,
  back,
  onBack,
  right,
  subtitle,
}: ScreenHeaderProps) {
  if (back) {
    return (
      <View className="flex-row items-center gap-3">
        <BackButton onPress={onBack} />
        <Text variant="heading" className="flex-1 text-center text-[21px]">
          {title}
        </Text>
        <View className="min-w-11 items-end">{right}</View>
      </View>
    );
  }

  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text variant="display" className="text-[30px] leading-9">
          {title}
        </Text>
        {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
      </View>
      {right ? <View className="flex-row gap-2.5">{right}</View> : null}
    </View>
  );
}
