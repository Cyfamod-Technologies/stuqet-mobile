import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "~/components/ui/chip";
import { EmptyState } from "~/components/ui/empty-state";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Skeleton } from "~/components/ui/skeleton";
import { DeliveryCard } from "../components/delivery-card";
import { useDeliveries } from "../hooks";
import type { DeliveryTab } from "../types";

const TABS: { value: DeliveryTab; label: string; empty: string }[] = [
  {
    value: "assigned",
    label: "Assigned",
    empty: "Deliveries assigned to you show up here.",
  },
  {
    value: "picked_up",
    label: "Picked up",
    empty: "Orders you collected from a vendor show up here.",
  },
  {
    value: "on_the_way",
    label: "On the way",
    empty: "Orders you are delivering right now show up here.",
  },
  {
    value: "completed",
    label: "Completed",
    empty: "Finished deliveries show up here.",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    empty: "Cancelled deliveries show up here.",
  },
];

// Deliveries board: "Your orders by status" with a chip per status and the
// deliveries of the chosen one.
export function DeliveriesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<DeliveryTab>("assigned");
  const list = useDeliveries(tab);
  const current = TABS.find((t) => t.value === tab) ?? TABS[0];

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        gap: 14,
      }}
    >
      <View className="px-5">
        <ScreenHeader title="Deliveries" subtitle="Your orders by status" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        className="grow-0"
      >
        {TABS.map((t) => (
          <Chip
            key={t.value}
            label={t.label}
            selected={tab === t.value}
            onPress={() => setTab(t.value)}
          />
        ))}
      </ScrollView>
      <View className="gap-3 px-5">
        {list.isLoading ? (
          <>
            <Skeleton className="h-32 rounded-card" />
            <Skeleton className="h-32 rounded-card" />
          </>
        ) : list.isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load deliveries"
            actionLabel="Try again"
            onAction={() => void list.refetch()}
          />
        ) : list.data && list.data.length === 0 ? (
          <EmptyState
            icon="bicycle-outline"
            title={`No ${current.label.toLowerCase()} deliveries`}
            message={current.empty}
          />
        ) : (
          list.data?.map((item) => (
            <DeliveryCard
              key={item.id}
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/deliveries/[id]",
                  params: { id: String(item.id) },
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
