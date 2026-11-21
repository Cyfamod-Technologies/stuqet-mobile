import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { SHADOWS } from "~/lib/colors";
import { formatOrderDate } from "../utils";
import type { OrderSummary } from "../types";
import { DeliveryStatusBadge, PaymentStatusBadge } from "./status-badge";

interface OrderCardProps {
  order: OrderSummary;
  onPress: (order: OrderSummary) => void;
}

// Row of the orders list: code (+ "New" while pending), date and total, then
// the delivery and payment badges. The list API has no customer name, item
// count or payment method, so those are not shown.
export function OrderCard({ order, onPress }: OrderCardProps) {
  const date = formatOrderDate(order.date);

  return (
    <Pressable
      onPress={() => onPress(order)}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.code}, ${order.total}, ${order.deliveryStatus.replace("_", " ")}, ${order.paymentStatus}. Opens order details`}
      style={SHADOWS.field}
      className="gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-90"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text
          variant="label"
          tone="muted"
          className="flex-1 font-sans-bold"
          numberOfLines={1}
        >
          #{order.code}
        </Text>
        {order.deliveryStatus === "pending" ? <Badge label="New" /> : null}
      </View>
      <View className="flex-row items-end justify-between gap-2">
        <Text variant="caption" className="text-sm leading-[18px]">
          Placed {date}
        </Text>
        <Text className="font-sans-extrabold text-xl leading-6">
          {order.total}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <DeliveryStatusBadge status={order.deliveryStatus} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </View>
    </Pressable>
  );
}

export function OrderCardSkeleton() {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
      <Skeleton className="h-4 w-40" />
      <View className="flex-row items-end justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-24" />
      </View>
      <View className="flex-row gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </View>
    </View>
  );
}
