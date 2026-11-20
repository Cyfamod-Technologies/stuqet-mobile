import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { DELIVERY_LABELS, STATUS_OPTIONS } from "../constants";
import type { DeliveryStatus } from "../types";
import { OptionRow } from "./option-row";

interface StatusSheetProps {
  visible: boolean;
  onClose: () => void;
  current: DeliveryStatus;
  onSave: (status: DeliveryStatus) => void;
}

// "Update delivery status" sheet. The backend does not enforce locks, so the
// app asks for confirmation before the two final statuses. There is no
// tracking code field: the API has nowhere to store one.
export function StatusSheet({
  visible,
  onClose,
  current,
  onSave,
}: StatusSheetProps) {
  const [selected, setSelected] = useState<DeliveryStatus>(current);

  useEffect(() => {
    if (visible) setSelected(current);
  }, [visible, current]);

  const save = () => {
    if (selected === current) {
      onClose();
      return;
    }
    if (selected === "delivered" || selected === "cancelled") {
      const action =
        selected === "cancelled"
          ? "Cancel this order?"
          : "Mark this order as delivered?";
      Alert.alert(
        action,
        `${DELIVERY_LABELS[selected]} orders are locked and cannot be changed again.`,
        [
          { text: "Go back", style: "cancel" },
          {
            text: selected === "cancelled" ? "Cancel order" : "Mark delivered",
            style: selected === "cancelled" ? "destructive" : "default",
            onPress: () => onSave(selected),
          },
        ],
      );
      return;
    }
    onSave(selected);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Update delivery status"
    >
      <View accessibilityRole="radiogroup">
        {STATUS_OPTIONS.map((option, index) => (
          <OptionRow
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onPress={() => setSelected(option.value)}
            last={index === STATUS_OPTIONS.length - 1}
          />
        ))}
      </View>
      <Text variant="caption" className="text-[13px] leading-[18px]">
        Delivered and cancelled orders are locked and cannot be changed again.
      </Text>
      <Button onPress={save}>Save status</Button>
    </BottomSheet>
  );
}
