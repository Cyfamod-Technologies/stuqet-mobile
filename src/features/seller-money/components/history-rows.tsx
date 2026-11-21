import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import type { CommissionItem, PaymentItem, WithdrawalItem } from "../types";
import {
  formatApiDate,
  formatLike,
  parseMoney,
  tidyMoney,
  tidyPaymentMethod,
} from "../utils";

const ROW = "min-h-16 flex-row items-center gap-3 px-4 py-2.5";

export function PaymentRow({ item }: { item: PaymentItem }) {
  const colors = useThemeColors();

  return (
    <View
      className={ROW}
      accessible
      accessibilityLabel={`${tidyPaymentMethod(item.payment_method)}, ${formatApiDate(item.payment_date)}, ${tidyMoney(item.amount)}`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-tint">
        <Ionicons
          name="business-outline"
          size={20}
          color={colors["brand-text"]}
        />
      </View>
      <View className="flex-1">
        <Text variant="heading" className="text-base" numberOfLines={1}>
          {tidyPaymentMethod(item.payment_method)}
        </Text>
        <Text variant="caption" className="text-[13px]">
          {formatApiDate(item.payment_date)}
        </Text>
      </View>
      <Text variant="heading" className="font-sans-extrabold text-base">
        {tidyMoney(item.amount)}
      </Text>
    </View>
  );
}

function statusVariant(status: string): "success" | "warning" | "outline" {
  const value = status.trim().toLowerCase();
  if (value === "paid") return "success";
  if (value === "pending") return "warning";
  return "outline";
}

export function WithdrawalRow({ item }: { item: WithdrawalItem }) {
  return (
    <View
      className={ROW}
      accessible
      accessibilityLabel={`${tidyMoney(item.amount)}, ${item.status}, ${formatApiDate(item.created_at)}`}
    >
      <View className="flex-1">
        <Text variant="heading" className="font-sans-extrabold text-base">
          {tidyMoney(item.amount)}
        </Text>
        <Text variant="caption" className="text-[13px]">
          {formatApiDate(item.created_at)}
        </Text>
      </View>
      <Badge label={item.status} variant={statusVariant(item.status)} />
    </View>
  );
}

export function CommissionRow({ item }: { item: CommissionItem }) {
  const commission = parseMoney(String(item.admin_commission));
  const commissionLabel = Number.isNaN(commission)
    ? null
    : formatLike(item.seller_earning, commission);

  return (
    <View
      className={ROW}
      accessible
      accessibilityLabel={`Order ${item.order_code}, earned ${tidyMoney(item.seller_earning)}`}
    >
      <View className="flex-1">
        <Text variant="heading" className="text-[15px]" numberOfLines={1}>
          {`#${item.order_code}`}
        </Text>
        <Text variant="caption" className="text-[13px]">
          {formatApiDate(item.created_at)}
          {commissionLabel ? ` · Commission ${commissionLabel}` : ""}
        </Text>
      </View>
      <Text variant="heading" className="font-sans-extrabold text-base">
        {tidyMoney(item.seller_earning)}
      </Text>
    </View>
  );
}
