import { useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { EmptyState } from "~/components/ui/empty-state";
import { Notice } from "~/components/ui/notice";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { formatNaira } from "~/lib/utils/format";
import {
  useChangeDeliveryStatus,
  useDelivery,
  useRequestCancellation,
} from "../hooks";
import type {
  DeliveryDetail,
  DeliveryStatus,
  DeliveryStatusChange,
  DeliveryStop,
} from "../types";

const STEPS: { label: string; status: DeliveryStatus[] }[] = [
  { label: "Assigned", status: ["pending", "confirmed"] },
  { label: "Picked up", status: ["picked_up"] },
  { label: "On the way", status: ["on_the_way"] },
  { label: "Delivered", status: ["delivered"] },
];

function Stepper({ status }: { status: DeliveryStatus }) {
  const colors = useThemeColors();
  const current = STEPS.findIndex((s) => s.status.includes(status));
  return (
    <Card className="flex-row items-start justify-between px-4 py-3.5">
      {STEPS.map((step, index) => {
        const done = index < current || status === "delivered";
        const active = index === current && status !== "delivered";
        return (
          <View key={step.label} className="flex-1 items-center gap-1.5">
            <View
              className={cn(
                "h-6 w-6 items-center justify-center rounded-full",
                done
                  ? "bg-primary"
                  : active
                    ? "border-[3px] border-primary bg-card"
                    : "bg-secondary",
              )}
            >
              {done ? (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={colors["primary-foreground"]}
                />
              ) : null}
            </View>
            <Text
              className={cn(
                "text-center font-sans-bold text-xs",
                !done && !active && "text-muted-foreground",
              )}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

function StopCard({
  kind,
  stop,
}: {
  kind: "pickup" | "dropoff";
  stop: DeliveryStop;
}) {
  const colors = useThemeColors();
  const pickup = kind === "pickup";
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        {pickup ? (
          <ShopLogo uri={stop.logo} name={stop.name} size={40} />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
            <Ionicons
              name="location-outline"
              size={20}
              color={colors["brand-text"]}
            />
          </View>
        )}
        <View className="min-w-0 flex-1">
          <Text className="font-sans-bold text-[11px] tracking-[1.2px] text-muted-foreground">
            {pickup ? "PICKUP" : "DROP-OFF"}
          </Text>
          <Text
            variant="heading"
            numberOfLines={1}
            className="text-base leading-[22px]"
          >
            {stop.name}
          </Text>
        </View>
      </View>
      <Text variant="meta">{stop.address}</Text>
      <View className="flex-row gap-2.5">
        <Button
          variant="soft"
          size="sm"
          className="flex-1"
          icon={
            <Ionicons
              name="navigate-outline"
              size={16}
              color={colors["brand-text"]}
            />
          }
          onPress={() =>
            void Linking.openURL(
              `https://maps.google.com/?q=${encodeURIComponent(stop.address)}`,
            )
          }
        >
          Navigate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          icon={
            <Ionicons name="call-outline" size={16} color={colors.foreground} />
          }
          onPress={() =>
            void Linking.openURL(`tel:${stop.phone.replace(/\s/g, "")}`)
          }
        >
          {stop.phone}
        </Button>
      </View>
    </Card>
  );
}

const NEXT: Partial<
  Record<DeliveryStatus, { label: string; status: DeliveryStatusChange }>
> = {
  pending: { label: "Mark as picked up", status: "picked_up" },
  confirmed: { label: "Mark as picked up", status: "picked_up" },
  picked_up: { label: "Start delivery", status: "on_the_way" },
  on_the_way: { label: "Mark as delivered", status: "delivered" },
};

// Delivery detail boards (assigned, picked up, on the way): the four-step
// progress, the pickup and drop-off stops with Navigate and call, the payment
// card, and one pinned action that moves the delivery on. "Mark as delivered"
// asks for confirmation (and that the cash was collected); "Request
// cancellation" opens a sheet.
export function DeliveryDetailScreen() {
  const insets = useSafeAreaInsets();
  const segments: string[] = useSegments();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useDelivery(Number(id));
  const change = useChangeDeliveryStatus();
  const cancel = useRequestCancellation();
  const [sheet, setSheet] = useState<"confirm" | "cancel" | null>(null);
  const [cashChecked, setCashChecked] = useState(false);
  const delivery = query.data;
  const tab = segments[1] === "deliveries" ? "deliveries" : "home";

  const advance = (item: DeliveryDetail, status: DeliveryStatusChange) =>
    change.mutate(
      { orderId: item.id, status },
      {
        onSuccess: () => {
          setSheet(null);
          void query.refetch();
          if (status === "delivered") {
            router.replace({
              pathname: `/(tabs)/${tab}/done` as never,
              params: {
                code: item.code,
                cash: item.cash ? String(item.amount) : "",
              },
            });
          }
        },
      },
    );

  const next = delivery ? NEXT[delivery.delivery_status] : undefined;
  const final =
    delivery?.delivery_status === "delivered" ||
    delivery?.delivery_status === "cancelled";

  return (
    <View className="flex-1">
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
            Delivery
          </Text>
          <View className="w-11" />
        </View>

        {query.isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-20 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
          </View>
        ) : query.isError || !delivery ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load this delivery"
            actionLabel="Try again"
            onAction={() => void query.refetch()}
          />
        ) : (
          <>
            <Text
              variant="meta"
              className="text-center font-sans-semibold"
            >{`#${delivery.code}`}</Text>
            {delivery.delivery_status === "cancelled" ? (
              <Notice tone="error" title="This delivery was cancelled">
                You do not need to deliver this order.
              </Notice>
            ) : (
              <Stepper status={delivery.delivery_status} />
            )}
            {delivery.cancel_request && !final ? (
              <Notice tone="warning" title="Cancellation requested">
                The team will review it. Keep the order until they reply.
              </Notice>
            ) : null}
            <StopCard kind="pickup" stop={delivery.pickup} />
            <StopCard kind="dropoff" stop={delivery.dropoff} />
            <Card className="gap-1.5">
              <View className="flex-row items-center justify-between gap-3">
                <View>
                  <Text variant="meta" className="text-xs">
                    {delivery.cash ? "Cash on delivery" : "Payment"}
                  </Text>
                  <Text className="font-sans-extrabold text-2xl">
                    {formatNaira(delivery.amount)}
                  </Text>
                </View>
                <Badge
                  label={
                    delivery.cash
                      ? delivery.delivery_status === "delivered"
                        ? "Cash collected"
                        : "Collect cash"
                      : "Paid online"
                  }
                  variant={
                    delivery.cash && delivery.delivery_status !== "delivered"
                      ? "warning"
                      : "success"
                  }
                />
              </View>
              <Text variant="meta">
                {delivery.cash
                  ? "Collect this amount from the customer when you hand over the order."
                  : "The customer already paid online. Do not collect any cash."}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>

      {delivery && !final ? (
        <ActionBar>
          {next ? (
            <Button
              loading={change.isPending && sheet === null}
              onPress={() => {
                if (next.status === "delivered") {
                  setCashChecked(false);
                  setSheet("confirm");
                } else advance(delivery, next.status);
              }}
            >
              {next.label}
            </Button>
          ) : null}
          {delivery.cancel_request ? null : (
            <Pressable
              onPress={() => setSheet("cancel")}
              accessibilityRole="button"
              className="min-h-11 items-center justify-center"
            >
              <Text className="font-sans-bold text-[15px] text-brand-text underline">
                Request cancellation
              </Text>
            </Pressable>
          )}
        </ActionBar>
      ) : null}

      <BottomSheet
        visible={sheet === "confirm"}
        onClose={() => setSheet(null)}
        title="Confirm delivery"
        subtitle={
          delivery ? `Hand the order to ${delivery.dropoff.name}.` : undefined
        }
      >
        {delivery ? (
          <View className="gap-3">
            {delivery.cash ? (
              <Pressable
                onPress={() => setCashChecked(!cashChecked)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: cashChecked }}
                className="min-h-14 flex-row items-center gap-3 rounded-field border border-border bg-field px-4"
              >
                <Checkbox
                  checked={cashChecked}
                  onCheckedChange={setCashChecked}
                />
                <Text className="flex-1 font-sans-bold text-[15px]">{`I collected ${formatNaira(delivery.amount)} in cash`}</Text>
              </Pressable>
            ) : null}
            <Button
              disabled={delivery.cash && !cashChecked}
              loading={change.isPending}
              onPress={() => advance(delivery, "delivered")}
            >
              Confirm delivered
            </Button>
          </View>
        ) : null}
      </BottomSheet>

      <BottomSheet
        visible={sheet === "cancel"}
        onClose={() => setSheet(null)}
        title="Request cancellation?"
        subtitle="The team will review it. Keep the order until they reply."
      >
        <View className="gap-3">
          <Button
            loading={cancel.isPending}
            onPress={() =>
              delivery &&
              cancel.mutate(delivery.id, {
                onSuccess: () => {
                  setSheet(null);
                  void query.refetch();
                },
              })
            }
          >
            Send request
          </Button>
          <Button variant="outline" onPress={() => setSheet(null)}>
            Keep delivery
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}
