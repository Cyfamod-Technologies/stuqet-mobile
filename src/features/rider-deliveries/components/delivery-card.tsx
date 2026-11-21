import { Pressable, View } from "react-native";
import { ShopLogo } from "~/components/shop-logo";
import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";
import { SHADOWS } from "~/lib/colors";
import { formatNaira } from "~/lib/utils/format";
import type { DeliveryItem, DeliveryStatus } from "../types";

const STATUS_VARIANT: Record<
  DeliveryStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "warning",
  confirmed: "warning",
  picked_up: "neutral",
  on_the_way: "neutral",
  delivered: "success",
  cancelled: "destructive",
};

export function DeliveryStatusBadge({ item }: { item: DeliveryItem }) {
  return (
    <Badge
      label={item.delivery_status_string}
      variant={STATUS_VARIANT[item.delivery_status]}
    />
  );
}

/** "Collect ₦4,500 cash" for cash orders still to be delivered, else "Paid online". */
export function PaymentPill({ item }: { item: DeliveryItem }) {
  const cash = item.payment_type.toLowerCase().includes("cash");
  if (!cash) return <Badge label="Paid online" variant="success" />;
  return item.delivery_status === "delivered" ? (
    <Badge
      label={`Cash collected ${formatNaira(item.amount)}`}
      variant="success"
    />
  ) : (
    <Badge
      label={`Collect ${formatNaira(item.amount)} cash`}
      variant="warning"
    />
  );
}

interface DeliveryCardProps {
  item: DeliveryItem;
  onPress: () => void;
  /** Home shows who to collect from; the full list does not. */
  showPickup?: boolean;
}

// A delivery (Home "Active deliveries", the Deliveries list): order number and
// status, the pickup vendor (Home), "Drop-off in <school>", when it was placed,
// the amount and what to do about payment.
export function DeliveryCard({ item, onPress, showPickup }: DeliveryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Order ${item.code}, ${item.delivery_status_string}`}
      style={SHADOWS.field}
      className="gap-2.5 rounded-card border border-border bg-card p-3.5 active:opacity-90"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="meta" className="font-sans-semibold" numberOfLines={1}>
          {`#${item.code}`}
        </Text>
        <DeliveryStatusBadge item={item} />
      </View>
      {showPickup ? (
        <View className="flex-row items-center gap-2">
          <ShopLogo uri={item.pickup_logo} name={item.pickup_name} size={24} />
          <Text
            className="font-sans-semibold text-[13px]"
            numberOfLines={1}
          >{`Pickup: ${item.pickup_name}`}</Text>
        </View>
      ) : null}
      <View className="flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text
            variant="heading"
            className="text-base leading-[22px]"
          >{`Drop-off in ${item.dropoff_area}`}</Text>
          <Text variant="meta">{item.date_label}</Text>
        </View>
        <Text className="font-sans-extrabold text-lg">
          {formatNaira(item.amount)}
        </Text>
      </View>
      <PaymentPill item={item} />
    </Pressable>
  );
}
