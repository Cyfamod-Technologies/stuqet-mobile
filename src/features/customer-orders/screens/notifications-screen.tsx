import { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { BackButton } from "~/components/ui/back-button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { useFoodNav } from "~/features/customer-food/navigation";
import { useRoleStore } from "~/lib/stores/role-store";
import { useRiderNotifications } from "~/features/rider-account/hooks";
import { useMarkNotificationsRead, useNotifications } from "../hooks";
import type { AppNotification } from "../types";

const ICONS: Record<
  AppNotification["kind"],
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  on_the_way: "bicycle-outline",
  confirmed: "checkmark-circle-outline",
  delivered: "checkmark",
  cancelled: "alert-circle-outline",
  message: "chatbubble-outline",
  assigned: "bicycle-outline",
  approved: "checkmark",
  info: "notifications-outline",
};

export function NotificationRows({
  items,
  onOpen,
}: {
  items: AppNotification[];
  onOpen?: (item: AppNotification) => void;
}) {
  const colors = useThemeColors();
  return (
    <Card className="overflow-hidden p-0">
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          disabled={!onOpen}
          onPress={() => onOpen?.(item)}
          accessibilityRole={onOpen ? "button" : undefined}
          className={cn(
            "flex-row items-start gap-3 px-3.5 py-3",
            index < items.length - 1 && "border-b border-divider",
          )}
        >
          <View
            className={cn(
              "mt-4 h-2 w-2 rounded-full",
              item.unread ? "bg-primary" : "bg-transparent",
            )}
          />
          {item.vendorLogo ? (
            <ShopLogo uri={item.vendorLogo} name={item.title} size={40} />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
              <Ionicons
                name={ICONS[item.kind]}
                size={20}
                color={colors["brand-text"]}
              />
            </View>
          )}
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-extrabold text-[15px] leading-5">
              {item.title}
            </Text>
            <Text variant="meta" numberOfLines={3}>
              {item.body}
            </Text>
          </View>
          <Text variant="caption" className="text-xs">
            {item.ago}
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}

// Notifications board (customer and rider): back, then the notifications in one
// card, unread ones with an orange dot. Opening the screen marks them read.
export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const role = useRoleStore((s) => s.role);
  const customer = useNotifications();
  const rider = useRiderNotifications();
  const markRead = useMarkNotificationsRead();
  const query = role === "rider" ? rider : customer;
  const items = query.data ?? [];
  const hasUnread = items.some((n) => n.unread);

  // Mark everything read shortly after the list has been seen.
  useEffect(() => {
    if (role !== "customer" || !hasUnread) return;
    const timer = setTimeout(() => markRead.mutate(), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, hasUnread]);

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 28,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      <View className="flex-row items-center gap-3">
        <BackButton />
        <Text variant="headerTitle" className="flex-1 text-center">
          Notifications
        </Text>
        <View className="w-11" />
      </View>
      {query.isLoading ? (
        <Skeleton className="h-48 rounded-card" />
      ) : query.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load notifications"
          actionLabel="Try again"
          onAction={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="Nothing new"
          message={
            role === "rider"
              ? "New deliveries and updates show up here."
              : "Order updates and replies from vendors show up here."
          }
        />
      ) : (
        <NotificationRows
          items={items}
          onOpen={
            role === "customer"
              ? (item) => item.orderId && nav.openTrack(item.orderId)
              : undefined
          }
        />
      )}
    </ScrollView>
  );
}
