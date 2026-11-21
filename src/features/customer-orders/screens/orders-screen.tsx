import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { ScreenHeader } from "~/components/ui/screen-header";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useFoodNav } from "~/features/customer-food/navigation";
import { formatNaira, itemsLabel } from "~/lib/utils/format";
import { notifySuccess } from "~/lib/utils/toast";
import { OrderStatusBadge } from "../components/status-badge";
import { ReviewSheet } from "../components/review-sheet";
import { useOrders, useReorder } from "../hooks";
import type { OrderSummary } from "../types";

function OrderCard({
  order,
  onTrack,
  onRate,
  onReorder,
  reordering,
}: {
  order: OrderSummary;
  onTrack: () => void;
  onRate: () => void;
  onReorder: () => void;
  reordering: boolean;
}) {
  const finished = order.status === "delivered" || order.status === "cancelled";
  return (
    <Card className="gap-3 p-3.5">
      <View className="flex-row items-center gap-3">
        <ShopLogo uri={order.vendor.logo} name={order.vendor.name} size={40} />
        <Text
          variant="heading"
          numberOfLines={1}
          className="flex-1 text-base leading-[22px]"
        >
          {order.vendor.name}
        </Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Text variant="meta">{`${itemsLabel(order.itemCount)} · #${order.code}`}</Text>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-sans-extrabold text-lg">
          {formatNaira(order.total)}
        </Text>
        <View className="flex-row gap-2">
          {order.canRate ? (
            <Button size="sm" variant="outline" onPress={onRate}>
              Rate
            </Button>
          ) : null}
          {finished ? (
            <Button size="sm" loading={reordering} onPress={onReorder}>
              Reorder
            </Button>
          ) : (
            <Button size="sm" onPress={onTrack}>
              Track
            </Button>
          )}
        </View>
      </View>
    </Card>
  );
}

// Orders board: Active and Past, each order as a card (vendor logo, status,
// items and code, total) with Track for live orders and Rate / Reorder for
// finished ones. Rate opens the review sheet; Reorder refills the cart.
export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const [tab, setTab] = useState<"active" | "past">("active");
  const [rating, setRating] = useState<OrderSummary | null>(null);
  const orders = useOrders(tab);
  const reorder = useReorder();

  const onReorder = (order: OrderSummary) =>
    reorder.mutate(order.id, {
      onSuccess: () => {
        notifySuccess({ message: "Items added to your cart" });
        nav.openCart();
      },
    });

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      <ScreenHeader title="Orders" />
      <SegmentedControl
        options={[
          { label: "Active", value: "active" },
          { label: "Past", value: "past" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "active" | "past")}
      />

      {orders.isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
        </View>
      ) : orders.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your orders"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void orders.refetch()}
        />
      ) : orders.data && orders.data.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={tab === "active" ? "No active orders" : "No past orders yet"}
          message={
            tab === "active"
              ? "When you order food it shows up here, live."
              : "Delivered and cancelled orders show up here."
          }
          actionLabel="Browse food"
          onAction={() => router.replace("/(tabs)/home")}
        />
      ) : (
        orders.data?.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            reordering={reorder.isPending && reorder.variables === order.id}
            onTrack={() => nav.openTrack(order.id)}
            onRate={() => setRating(order)}
            onReorder={() => onReorder(order)}
          />
        ))
      )}

      <ReviewSheet order={rating} onClose={() => setRating(null)} />
    </ScrollView>
  );
}
