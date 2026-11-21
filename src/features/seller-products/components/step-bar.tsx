import { View } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface StepBarProps {
  /** 1-based current step. */
  step: number;
  total: number;
  label: string;
}

// Two-step form progress as drawn on the add forms: 6px bars, then
// "Step 1 of 2 · Details" in 13px semibold muted.
export function StepBar({ step, total, label }: StepBarProps) {
  return (
    <View
      className="gap-1.5"
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${step} of ${total}, ${label}`}
      accessibilityValue={{ min: 1, max: total, now: step }}
    >
      <View className="flex-row gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </View>
      <Text tone="muted" className="font-sans-semibold text-[13px]">
        Step {step} of {total} · {label}
      </Text>
    </View>
  );
}
