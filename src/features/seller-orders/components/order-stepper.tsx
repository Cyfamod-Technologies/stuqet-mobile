import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";
import { DELIVERY_LABELS, DELIVERY_STEPS } from "../constants";
import type { DeliveryStatus } from "../types";

// Five-step progress: Pending, Confirmed, Picked up, On the way, Delivered.
// Past steps get a check, the current one an orange dot, the rest are empty.
export function OrderStepper({ status }: { status: DeliveryStatus }) {
  const colors = useThemeColors();
  const current = DELIVERY_STEPS.indexOf(status);

  return (
    <View
      accessible
      accessibilityLabel={`Delivery progress: ${DELIVERY_LABELS[status]}`}
      className="flex-row px-2 pb-3 pt-4"
    >
      {DELIVERY_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const isLast = index === DELIVERY_STEPS.length - 1;

        return (
          <View key={step} className="flex-1 items-center gap-1.5">
            {!isLast ? (
              <View
                className={cn(
                  "absolute left-1/2 top-[13px] h-0.5 w-full",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
            <View
              className={cn(
                "h-7 w-7 items-center justify-center rounded-full border-2",
                done || active
                  ? "border-primary bg-primary"
                  : "border-hint bg-card",
              )}
            >
              {done ? (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors["primary-foreground"]}
                />
              ) : (
                <View
                  className={cn(
                    "h-2 w-2 rounded-full",
                    active ? "bg-primary-foreground" : "bg-hint",
                  )}
                />
              )}
            </View>
            <Text
              className={cn(
                "text-center text-[11px] leading-[13px]",
                active
                  ? "font-sans-extrabold"
                  : "font-sans-semibold text-muted-foreground",
              )}
            >
              {DELIVERY_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
