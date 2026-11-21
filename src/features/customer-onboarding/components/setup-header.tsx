import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { BackButton } from "~/components/ui/back-button";
import { StepProgress } from "~/components/ui/step-progress";
import { Text } from "~/components/ui/text";

interface SetupHeaderProps {
  step: number;
  total: number;
  label: string;
  onBack?: () => void;
  onSkip?: () => void;
}

// Top row of the set-up and rider onboarding boards: round back button, the
// "Step 2 of 4 · Food you like" progress bar and an underlined Skip.
export function SetupHeader({
  step,
  total,
  label,
  onBack,
  onSkip,
}: SetupHeaderProps) {
  return (
    <View className="flex-row items-center gap-3">
      <BackButton
        onPress={
          onBack ?? (() => (router.canGoBack() ? router.back() : undefined))
        }
      />
      <View className="min-w-0 flex-1">
        <StepProgress step={step} total={total} label={label} />
      </View>
      {onSkip ? (
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            Skip
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
