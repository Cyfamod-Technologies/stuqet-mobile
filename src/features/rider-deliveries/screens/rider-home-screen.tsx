import { useEffect } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { SectionHeader } from "~/components/ui/section-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import {
  useRiderNotifications,
  useRiderProfile,
} from "~/features/rider-account/hooks";
import { useThemeColors } from "~/lib/colors";
import { DeliveryCard } from "../components/delivery-card";
import { useDashboard, useDeliveries } from "../hooks";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <Card className="min-h-[72px] flex-1 justify-between gap-1 p-3">
      <Text className="font-sans-extrabold text-[22px] leading-7">{value}</Text>
      <Text variant="meta" className="text-xs leading-4">
        {label}
      </Text>
    </Card>
  );
}

// Rider Home board: avatar, greeting and bell; the dark "Earned today" card;
// four counters (Assigned, Picked up, On the way, Done); cash collected today;
// and the active deliveries. A rider whose application is pending is sent to
// the "under review" screen instead.
export function RiderHomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const profile = useRiderProfile();
  const dashboard = useDashboard();
  const assigned = useDeliveries("assigned");
  const picked = useDeliveries("picked_up");
  const onTheWay = useDeliveries("on_the_way");
  const notifications = useRiderNotifications();

  const pending = profile.data?.status === "pending";
  useEffect(() => {
    if (pending) router.replace("/rider-setup/review");
  }, [pending]);

  const summary = dashboard.data;
  const active = [
    ...(onTheWay.data ?? []),
    ...(picked.data ?? []),
    ...(assigned.data ?? []),
  ];
  const loading = dashboard.isLoading || assigned.isLoading;
  const unread = (notifications.data ?? []).some((n) => n.unread);
  const refresh = () => {
    void dashboard.refetch();
    void assigned.refetch();
    void picked.refetch();
    void onTheWay.refetch();
  };

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={dashboard.isRefetching && !loading}
          onRefresh={refresh}
        />
      }
    >
      <View className="flex-row items-center gap-3">
        <Avatar
          src={profile.data?.avatar}
          name={profile.data?.name}
          size="lg"
        />
        <View className="min-w-0 flex-1">
          <Text variant="meta" className="text-[13px]">
            {greeting()}
          </Text>
          <Text
            variant="heading"
            numberOfLines={1}
            className="text-xl leading-6"
          >
            {profile.data?.name.split(" ")[0] ?? ""}
          </Text>
        </View>
        <RoundIconButton
          icon="notifications-outline"
          label="Notifications"
          dot={unread}
          onPress={() => router.push("/(tabs)/home/notifications")}
        />
      </View>

      {loading ? (
        <View className="gap-3">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
          <Skeleton className="h-36 rounded-card" />
        </View>
      ) : dashboard.isError || !summary ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your deliveries"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={refresh}
        />
      ) : (
        <>
          <View className="gap-1 rounded-card bg-foreground p-5">
            <Text className="font-sans-semibold text-[13px] text-subtle">
              Earned today
            </Text>
            <Text className="font-sans-extrabold text-[38px] leading-[46px] text-background">
              {summary.today_earning}
            </Text>
            <View className="flex-row gap-4">
              <Text className="font-sans-medium text-[13px] text-subtle">{`Yesterday ${summary.yesterday_earning}`}</Text>
              <Text className="font-sans-medium text-[13px] text-subtle">{`Total ${summary.total_earning.replace(".00", "")}`}</Text>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <StatTile value={summary.assigned} label="Assigned" />
            <StatTile value={summary.picked} label="Picked up" />
            <StatTile value={summary.on_the_way} label="On the way" />
            <StatTile value={summary.completed_delivery} label="Done" />
          </View>

          <Card className="flex-row items-center gap-3 p-3.5">
            <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
              <Ionicons
                name="cash-outline"
                size={20}
                color={colors["brand-text"]}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Text variant="meta" className="text-xs">
                Cash collected today
              </Text>
              <Text className="font-sans-extrabold text-lg">
                {summary.today_collection}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/earnings")}
              accessibilityRole="button"
              className="min-h-11 justify-center"
            >
              <Text className="font-sans-bold text-[13px] text-brand-text underline">
                Details
              </Text>
            </Pressable>
          </Card>

          <View className="gap-3">
            <SectionHeader
              title="Active deliveries"
              actionLabel="See all"
              onAction={() => router.push("/(tabs)/deliveries")}
            />
            {active.length === 0 ? (
              <EmptyState
                icon="bicycle-outline"
                title="No active deliveries"
                message="New deliveries are assigned to you by the team. You will get a notification."
              />
            ) : (
              active.slice(0, 3).map((item) => (
                <DeliveryCard
                  key={item.id}
                  item={item}
                  showPickup
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/home/delivery/[id]",
                      params: { id: String(item.id) },
                    })
                  }
                />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
