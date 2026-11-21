import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
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
import { OrderSearchField } from "./order-search-field";
import { PaymentFilterSheet } from "./payment-filter-sheet";

function parseStatusParam(value: string | undefined): DeliveryStatus | "" {
  const match = DELIVERY_FILTERS.find((f) => f.value && f.value === value);
  return match ? (match.value as DeliveryStatus) : "";
}

// Orders tab: status chips map to the API's delivery_status filter, the filter
// sheet to payment_status. The API has no search, so the search box filters the
// loaded pages client-side (by code or total) and keeps loading pages while a
// search is active, up to SEARCH_MAX_PAGES.
const SEARCH_MAX_PAGES = 20;

function matchesSearch(order: OrderSummary, term: string): boolean {
  const needle = term.trim().replace(/^#/, "").toLowerCase();
  if (!needle) return true;
  if (order.code.toLowerCase().includes(needle)) return true;
  const digits = needle.replace(/[^0-9.]/g, "");
  return (
    digits.length > 0 && order.total.replace(/[^0-9.]/g, "").includes(digits)
  );
}

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
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pulling, setPulling] = useState(false);

  // Re-apply the filter whenever Home links here again (adjusted during render
  // rather than in an effect).
  const paramKey = `${params.status ?? ""}|${params.t ?? ""}`;
  const [appliedKey, setAppliedKey] = useState(paramKey);
  if (appliedKey !== paramKey) {
    setAppliedKey(paramKey);
    if (params.status !== undefined) {
      setDelivery(parseStatusParam(params.status));
    }
  }

  const query = useOrders({
    deliveryStatus: delivery || undefined,
    paymentStatus: payment || undefined,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = query;

  const searching = search.trim().length > 0;
  const pageCount = query.data?.pages.length ?? 0;
  const orders = useMemo(() => {
    const all = query.data?.pages.flatMap((page) => page.orders) ?? [];
    return searching ? all.filter((o) => matchesSearch(o, search)) : all;
  }, [query.data, search, searching]);

  // While searching, pull in the remaining pages so matches are not missed.
  useEffect(() => {
    if (
      searching &&
      hasNextPage &&
      !isFetchingNextPage &&
      pageCount < SEARCH_MAX_PAGES
    ) {
      fetchNextPage();
    }
  }, [searching, hasNextPage, isFetchingNextPage, pageCount, fetchNextPage]);

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
      <ScreenHeader title="Orders" />
      <View className="flex-row items-center gap-2.5">
        <OrderSearchField value={search} onChangeText={setSearch} />
        <RoundIconButton
          icon="options-outline"
          label="Filters"
          dot={payment !== ""}
          onPress={() => setSheetOpen(true)}
        />
      </View>
      <FilterChips
        accessibilityLabel="Filter orders by delivery status"
        options={DELIVERY_FILTERS}
        value={delivery}
        onChange={setDelivery}
      />
    </View>
  );

  let empty: ReactElement;
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
    const filtered = delivery !== "" || payment !== "" || searching;
    empty = (
      <EmptyState
        icon="receipt-outline"
        title={filtered ? "No matching orders" : "No orders yet"}
        message={
          filtered
            ? "Try another status or search, or clear the filters."
            : "New orders from your customers will show up here."
        }
        actionLabel={filtered ? "Clear filters" : undefined}
        onAction={() => {
          setDelivery("");
          setPayment("");
          setSearch("");
        }}
      />
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={orders}
        keyExtractor={(order) => String(order.id)}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={openOrder} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          isFetchingNextPage ||
          (searching && hasNextPage && pageCount < SEARCH_MAX_PAGES) ? (
            <View className="py-4">
              <ActivityIndicator color={colors["brand-text"]} />
            </View>
          ) : undefined
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
        onApply={setPayment}
      />
    </View>
  );
}
