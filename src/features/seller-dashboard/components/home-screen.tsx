import { useState } from "react";
import { RefreshControl, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "~/components/screen";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { useShopInfo, useShopType } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { FoodHome, ProductHome, ServiceHome } from "./home-layouts";

function HomeSkeleton() {
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-40" />
        </View>
        <Skeleton className="h-11 w-11 rounded-full" />
      </View>
      <Skeleton className="h-52 rounded-3xl" />
      <View className="flex-row gap-2.5">
        <Skeleton className="h-28 flex-1 rounded-[20px]" />
        <Skeleton className="h-28 flex-1 rounded-[20px]" />
        <Skeleton className="h-28 flex-1 rounded-[20px]" />
      </View>
      <Skeleton className="h-24 rounded-[20px]" />
    </View>
  );
}

// Home tab. The layout follows the shop type (product, food or service); until
// the API returns a business category every shop gets the product layout.
export function HomeScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const shop = useShopInfo();
  const shopType = useShopType();
  const [pulling, setPulling] = useState(false);

  const refresh = async () => {
    setPulling(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.seller.dashboard,
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.seller.orders.all,
        }),
        // Only the unread count: the list itself marks everything as read
        // when fetched, so it is left for the Notifications screen.
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.seller.notifications, "unread"],
        }),
      ]);
    } finally {
      setPulling(false);
    }
  };

  let content;
  if (shop.isPending) {
    content = <HomeSkeleton />;
  } else if (shop.isError || !shop.data) {
    content = (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load your shop"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => shop.refetch()}
      />
    );
  } else if (shopType === "food") {
    content = <FoodHome shop={shop.data} />;
  } else if (shopType === "service") {
    content = <ServiceHome shop={shop.data} />;
  } else {
    content = <ProductHome shop={shop.data} />;
  }

  return (
    <Screen
      contentContainerStyle={{ gap: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {content}
    </Screen>
  );
}
