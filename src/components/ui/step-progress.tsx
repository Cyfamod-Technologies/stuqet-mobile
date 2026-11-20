import { View } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface StepProgressProps {
  /** 1-based current step. */
  step: number;
  total: number;
  label?: string;
}

// "Step 2 of 3" with a segmented bar — registration wizards.
export function StepProgress({ step, total, label }: StepProgressProps) {
  return (
    <View
      className="gap-2"
      accessibilityRole="progressbar"
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
      <Text variant="caption">
        Step {step} of {total}
        {label ? ` · ${label}` : ""}
      </Text>
    </View>
  );
}
