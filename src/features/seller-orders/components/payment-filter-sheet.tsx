import { useState } from "react";
import { View } from "react-native";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { PAYMENT_FILTERS } from "../constants";
import type { PaymentStatus } from "../types";
import { OptionRow } from "./option-row";

interface PaymentFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  value: PaymentStatus | "";
  onApply: (value: PaymentStatus | "") => void;
}

// "Filters" sheet (OrdersFilter board): payment status radios with Reset and
// Apply. Choosing a radio changes nothing until Apply; Reset clears the filter.
export function PaymentFilterSheet({
  visible,
  onClose,
  value,
  onApply,
}: PaymentFilterSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      {/* Mounted only while open, so the draft restarts from the applied value. */}
      <FilterBody value={value} onApply={onApply} onClose={onClose} />
    </BottomSheet>
  );
}

function FilterBody({
  value,
  onApply,
  onClose,
}: Omit<PaymentFilterSheetProps, "visible">) {
  const [draft, setDraft] = useState<PaymentStatus | "">(value);

  return (
    <>
      <View className="gap-0.5">
        <Text tone="muted" className="font-sans-bold text-sm">
          Payment status
        </Text>
        <View accessibilityRole="radiogroup">
          {PAYMENT_FILTERS.map((option, index) => (
            <OptionRow
              key={option.value || "all"}
              label={option.label}
              selected={draft === option.value}
              onPress={() => setDraft(option.value)}
              last={index === PAYMENT_FILTERS.length - 1}
            />
          ))}
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            variant="outline"
            onPress={() => {
              onApply("");
              onClose();
            }}
          >
            Reset
          </Button>
        </View>
        <View className="flex-[2]">
          <Button
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply
          </Button>
        </View>
      </View>
    </>
  );
}
