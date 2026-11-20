import { useRouter } from "expo-router";
import { View } from "react-native";
import { Card } from "~/components/ui/card";
import { SectionHeader } from "~/components/ui/section-header";
import { Text } from "~/components/ui/text";
import {
  OrderCard,
  OrderCardSkeleton,
} from "~/features/seller-orders/components/order-card";
import { useRecentOrders } from "~/features/seller-orders/hooks";
import { HOME_LINKS } from "../constants";

// Latest three orders; each opens Order details. Hidden if the request fails
// (the Orders tab has the full list and error handling).
export function RecentOrders() {
  const router = useRouter();
  const recent = useRecentOrders(3);

  if (recent.isError) return null;

  return (
    <View className="gap-4">
      <SectionHeader
        title="Recent orders"
        actionLabel="View all"
        onAction={() => router.navigate(HOME_LINKS.orders)}
      />
      {recent.isPending ? (
        <>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </>
      ) : recent.data.length === 0 ? (
        <Card className="px-4 py-3.5">
          <Text tone="muted">
            No orders yet. New orders from your customers will show up here.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {recent.data.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                router.push({
                  pathname: "/orders/[id]",
                  params: { id: String(order.id) },
                })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}
