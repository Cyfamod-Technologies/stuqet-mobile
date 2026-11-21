import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "~/lib/colors";
import { EmptyState } from "~/components/ui/empty-state";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { ScreenHeader } from "~/components/ui/screen-header";
import { DELIVERY_FILTERS } from "../constants";
import { useOrders } from "../hooks";
import type { DeliveryStatus, OrderSummary, PaymentStatus } from "../types";
import { FilterChips } from "./filter-chips";
import { OrderCard, OrderCardSkeleton } from "./order-card";
import { PaymentFilterSheet } from "./payment-filter-sheet";

function parseStatusParam(value: string | undefined): DeliveryStatus | "" {
  const match = DELIVERY_FILTERS.find((f) => f.value && f.value === value);
  return match ? (match.value as DeliveryStatus) : "";
}

// Orders tab: status chips map to the API's delivery_status filter, the filter
// button to payment_status. Search and export are left out: the API has
// neither (see the vendor API audit).
export function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  // Home links here with ?status=pending; `t` forces a re-apply on repeat taps.
  const params = useLocalSearchParams<{ status?: string; t?: string }>();

  const [delivery, setDelivery] = useState<DeliveryStatus | "">(
    parseStatusParam(params.status),
  );
  const [payment, setPayment] = useState<PaymentStatus | "">("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    if (params.status !== undefined) {
      setDelivery(parseStatusParam(params.status));
    }
  }, [params.status, params.t]);

  const query = useOrders({
    deliveryStatus: delivery || undefined,
    paymentStatus: payment || undefined,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = query;

  const orders = useMemo(
    () => query.data?.pages.flatMap((page) => page.orders) ?? [],
    [query.data],
  );

  const openOrder = useCallback(
    (order: OrderSummary) =>
      router.push({
        pathname: "/orders/[id]",
        params: { id: String(order.id) },
      }),
    [router],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = useCallback(() => {
    setPulling(true);
    refetch().finally(() => setPulling(false));
  }, [refetch]);

  const header = (
    <View className="gap-4 pb-2">
      <ScreenHeader
        title="Orders"
        right={
          <RoundIconButton
            icon="options-outline"
            label="Filter by payment status"
            dot={payment !== ""}
            onPress={() => setSheetOpen(true)}
          />
        }
      />
      <FilterChips
        accessibilityLabel="Filter orders by delivery status"
        options={DELIVERY_FILTERS}
        value={delivery}
        onChange={setDelivery}
      />
    </View>
  );

  let empty = null;
  if (query.isPending) {
    empty = (
      <View className="gap-4">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </View>
    );
  } else if (query.isError) {
    empty = (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load orders"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => refetch()}
      />
    );
  } else {
    const filtered = delivery !== "" || payment !== "";
    empty = (
      <EmptyState
        icon="receipt-outline"
        title={filtered ? "No matching orders" : "No orders yet"}
        message={
          filtered
            ? "Try another status or clear the payment filter."
            : "New orders from your customers will show up here."
        }
        actionLabel={filtered ? "Clear filters" : undefined}
        onAction={() => {
          setDelivery("");
          setPayment("");
        }}
      />
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={orders}
        keyExtractor={(order) => String(order.id)}
        renderItem={({ item }) => <OrderCard order={item} onPress={openOrder} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={colors["brand-text"]} />
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
          gap: 12,
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={pulling}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
      <PaymentFilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={payment}
        onChange={setPayment}
      />
    </View>
  );
}
