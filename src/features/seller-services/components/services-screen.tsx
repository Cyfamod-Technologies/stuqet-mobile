import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "~/lib/colors";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Chip } from "~/features/seller-products/components/chip";
import { ListHeader } from "~/features/seller-products/components/list-header";
import { useChangeProductStatus } from "~/features/seller-products/hooks";
import type { SellerProduct } from "~/features/seller-products/types";
import { useSellerServices } from "../hooks";
import {
  SERVICE_FILTERS,
  matchesServiceFilter,
  servicesSummary,
  type ServiceFilter,
} from "../utils";
import { ServiceRow } from "./service-row";

// Space under the list so the last row clears the floating Add button.
const LIST_BOTTOM_PADDING = 112;

export function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  // TODO(backend): runs on the loaded pages only (no server filter yet).
  const [filter, setFilter] = useState<ServiceFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const list = useSellerServices();
  const {
    mutate: changeStatus,
    isPending,
    variables,
  } = useChangeProductStatus();

  const total = list.data?.pages[0]?.meta?.total;
  const filtersActive = filter !== "all";

  const items = useMemo(
    () =>
      (list.data?.pages.flatMap((page) => page.data) ?? []).filter((service) =>
        matchesServiceFilter(service, filter),
      ),
    [list.data, filter],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await list.refetch();
    setRefreshing(false);
  }, [list]);

  const onEndReached = () => {
    if (list.hasNextPage && !list.isFetchingNextPage && !list.isError) {
      void list.fetchNextPage();
    }
  };

  const onTogglePublished = useCallback(
    (service: SellerProduct, next: boolean) =>
      changeStatus({ id: service.id, status: next }),
    [changeStatus],
  );

  const goToForm = () => router.push("/services/add");

  const renderEmpty = () => {
    if (list.isLoading) {
      return (
        <View className="gap-4" accessibilityLabel="Loading your services">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[84px] rounded-[20px]" />
          ))}
        </View>
      );
    }
    if (list.isError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your services"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void list.refetch()}
        />
      );
    }
    // A client-side filter over partial data: keep loading before giving up.
    if (filtersActive && list.hasNextPage) {
      return (
        <View className="items-center py-10">
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (filtersActive) {
      return (
        <EmptyState
          icon="funnel-outline"
          title="Nothing here"
          message="No services match this filter."
        />
      );
    }
    return (
      <EmptyState
        icon="construct-outline"
        title="No services yet"
        message="Add your first service and it will show up here."
        actionLabel="Add service"
        onAction={goToForm}
      />
    );
  };

  const renderFooter = () => {
    if (list.isFetchingNextPage) {
      return (
        <View className="items-center py-4">
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (list.isFetchNextPageError) {
      return (
        <View className="items-center py-3">
          <Button
            variant="soft"
            size="sm"
            onPress={() => void list.fetchNextPage()}
          >
            {"Couldn't load more. Retry"}
          </Button>
        </View>
      );
    }
    return null;
  };

  return (
    <View className="flex-1">
      <View className="gap-4 px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <ListHeader title="Services" subtitle={servicesSummary(total)} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 grow-0"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          accessibilityRole="tablist"
        >
          {SERVICE_FILTERS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => setFilter(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ServiceRow
            service={item}
            onTogglePublished={onTogglePublished}
            busy={isPending && variables?.id === item.id}
          />
        )}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingBottom: LIST_BOTTOM_PADDING,
        }}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <Button
        onPress={goToForm}
        icon={
          <Ionicons name="add" size={26} color={colors["primary-foreground"]} />
        }
        className="absolute bottom-5 right-5 min-h-[60px] pl-[18px] pr-6"
      >
        Add
      </Button>
    </View>
  );
}
