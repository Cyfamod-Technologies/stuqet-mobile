import { View } from "react-native";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { PAYMENT_FILTERS } from "../constants";
import type { PaymentStatus } from "../types";
import { OptionRow } from "./option-row";

interface PaymentFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  value: PaymentStatus | "";
  onChange: (value: PaymentStatus | "") => void;
}

export function PaymentFilterSheet({
  visible,
  onClose,
  value,
  onChange,
}: PaymentFilterSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter by payment">
      <View accessibilityRole="radiogroup">
        {PAYMENT_FILTERS.map((option, index) => (
          <OptionRow
            key={option.value || "all"}
            label={option.label}
            selected={value === option.value}
            onPress={() => {
              onChange(option.value);
              onClose();
            }}
            last={index === PAYMENT_FILTERS.length - 1}
          />
        ))}
      </View>
    </BottomSheet>
  );
}
