import { useState } from "react";
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
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Update delivery status"
    >
      {/* Mounted only while the modal is open, so the selection restarts at
          the order's current status each time. */}
      <StatusSheetBody current={current} onClose={onClose} onSave={onSave} />
    </BottomSheet>
  );
}

function StatusSheetBody({
  current,
  onClose,
  onSave,
}: Omit<StatusSheetProps, "visible">) {
  const [selected, setSelected] = useState<DeliveryStatus>(current);

  const save = () => {
    if (selected === current) {
      onClose();
      return;
    }
    if (selected === "delivered" || selected === "cancelled") {
      const cancelling = selected === "cancelled";
      Alert.alert(
        cancelling ? "Cancel this order?" : "Mark this order as delivered?",
        `${DELIVERY_LABELS[selected]} orders are locked and cannot be changed again.`,
        [
          { text: "Go back", style: "cancel" },
          {
            text: cancelling ? "Cancel order" : "Mark delivered",
            style: cancelling ? "destructive" : "default",
            onPress: () => onSave(selected),
          },
        ],
      );
      return;
    }
    onSave(selected);
  };

  return (
    <>
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
    </>
  );
}
