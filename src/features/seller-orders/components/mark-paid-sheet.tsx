import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import type { OrderDetail } from "../types";

interface MarkPaidSheetProps {
  visible: boolean;
  onClose: () => void;
  order: OrderDetail;
  loading: boolean;
  onConfirm: () => void;
}

// "Mark as paid?" confirmation (OrderMarkPaid board). Cash on delivery and
// offline payments are confirmed by the seller after receiving the money.
export function MarkPaidSheet({
  visible,
  onClose,
  order,
  loading,
  onConfirm,
}: MarkPaidSheetProps) {
  const colors = useThemeColors();
  const method =
    order.paymentMethod === "cash_on_delivery"
      ? "cash on delivery"
      : "an offline payment";

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mark as paid?">
      <Text tone="muted" className="font-sans-medium leading-[22px]">
        Order #{order.code} is {method}. Confirm only after you have received
        the money from the customer.
      </Text>
      <Card className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-tint">
          <Ionicons
            name="cash-outline"
            size={20}
            color={colors["brand-text"]}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text
            variant="caption"
            className="font-sans-medium text-[13px]"
            numberOfLines={1}
          >
            Amount received from {order.customer.name}
          </Text>
          <Text className="font-sans-extrabold text-[22px] leading-7">
            {order.total}
          </Text>
        </View>
      </Card>
      <Button loading={loading} onPress={onConfirm}>
        Yes, mark as paid
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="min-h-[52px]"
        textClassName="text-[17px]"
        disabled={loading}
        onPress={onClose}
      >
        Not yet
      </Button>
    </BottomSheet>
  );
}
