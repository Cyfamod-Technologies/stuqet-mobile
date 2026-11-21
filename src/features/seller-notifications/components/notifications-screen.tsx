import { useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "~/components/screen";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { ScreenHeader } from "~/components/ui/screen-header";
import { useThemeColors } from "~/lib/colors";
import { FilterChips } from "~/features/seller-orders/components/filter-chips";
import { useNotifications } from "../hooks";
import type { NotificationFilter, SellerNotification } from "../types";
import { NotificationRow, NotificationRowSkeleton } from "./notification-row";

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "products", label: "Products" },
  { value: "payouts", label: "Payouts" },
];

// Notifications come from the shared customer routes. The payload's class name
// tells the category, which drives the chips.
export function NotificationsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const query = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [pulling, setPulling] = useState(false);

  const all = query.data;
  const items = useMemo(
    () => (all ?? []).filter((n) => filter === "all" || n.category === filter),
    [all, filter],
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const open = (notification: SellerNotification) => {
    if (notification.orderId !== null) {
      router.push({
        pathname: "/orders/[id]",
        params: { id: String(notification.orderId) },
      });
    }
  };

  const refresh = () => {
    setPulling(true);
    query.refetch().finally(() => setPulling(false));
  };

  let body;
  if (query.isPending) {
    body = (
      <Card className="overflow-hidden p-0">
        {[0, 1, 2, 3].map((i) => (
          <NotificationRowSkeleton key={i} last={i === 3} />
        ))}
      </Card>
    );
  } else if (query.isError) {
    body = (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load notifications"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => query.refetch()}
      />
    );
  } else if (items.length === 0) {
    body = (
      <EmptyState
        icon="notifications-outline"
        title="No notifications"
        message={
          filter === "all"
            ? "Order, product and payout updates will show up here."
            : "Nothing in this category yet."
        }
      />
    );
  } else {
    body = (
      <Card className="overflow-hidden p-0">
        {items.map((notification, index) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            last={index === items.length - 1}
            onPress={open}
          />
        ))}
      </Card>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader back title="Notifications" onBack={goBack} />
      {all && all.length > 0 ? (
        <FilterChips
          accessibilityLabel="Filter notifications by category"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      ) : null}
      <View>{body}</View>
    </Screen>
  );
}
