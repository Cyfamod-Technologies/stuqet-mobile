import { useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { Avatar } from "~/components/ui/avatar";
import { BackButton } from "~/components/ui/back-button";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Notice } from "~/components/ui/notice";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useFoodNav } from "~/features/customer-food/navigation";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { formatNaira } from "~/lib/utils/format";
import { TrackMap } from "../components/track-map";
import { useOrder, useTracking } from "../hooks";
import type { TrackStep } from "../types";

function StepDot({ state }: { state: TrackStep["state"] }) {
  const colors = useThemeColors();
  if (state === "done") {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-success">
        <Ionicons name="checkmark" size={15} color={colors.card} />
      </View>
    );
  }
  return (
    <View
      className={cn(
        "h-6 w-6 rounded-full",
        state === "current"
          ? "border-[3px] border-primary bg-card"
          : "bg-secondary",
      )}
    />
  );
}

function Steps({ steps }: { steps: TrackStep[] }) {
  return (
    <Card className="p-4">
      {steps.map((step, index) => (
        <View key={step.key} className="flex-row gap-3.5">
          <View className="items-center">
            <StepDot state={step.state} />
            {index < steps.length - 1 ? (
              <View
                className={cn(
                  "my-0.5 w-0.5 flex-1",
                  step.state === "done" ? "bg-success" : "bg-border",
                )}
              />
            ) : null}
          </View>
          <View
            className={cn(
              "min-w-0 flex-1 gap-0.5",
              index < steps.length - 1 ? "pb-4" : "",
            )}
          >
            <Text
              className={cn(
                "font-sans-extrabold text-[17px] leading-6",
                step.state === "todo" && "text-muted-foreground",
              )}
            >
              {step.title}
            </Text>
            {step.subtitle ? <Text variant="meta">{step.subtitle}</Text> : null}
          </View>
        </View>
      ))}
    </Card>
  );
}

// Track order board: the order number and vendor, the steps (Confirmed, Picked
// up, On the way, Delivered) with the current one ringed, the rider with a call
// button, "Message <vendor>" and "Order summary" (a sheet). The tracking
// request repeats every few seconds, so the steps and the rider dot move.
export function TrackScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const tracking = useTracking(orderId);
  const order = useOrder(orderId);
  const [summary, setSummary] = useState(false);

  const data = tracking.data;
  const detail = order.data;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 32,
          paddingHorizontal: 20,
          gap: 14,
        }}
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="headerTitle" className="flex-1 text-center">
            Track order
          </Text>
          <View className="w-11" />
        </View>

        {tracking.isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-40 rounded-card" />
            <Skeleton className="h-52 rounded-card" />
            <Skeleton className="h-20 rounded-card" />
          </View>
        ) : tracking.isError || !data ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load this order"
            message="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => void tracking.refetch()}
          />
        ) : (
          <>
            <View className="flex-row items-center justify-center gap-2">
              <ShopLogo
                uri={data.order.vendor.logo}
                name={data.order.vendor.name}
                size={24}
              />
              <Text variant="meta" className="font-sans-semibold">
                {`#${data.order.code} · ${data.order.vendor.name}`}
              </Text>
            </View>

            {data.order.status === "cancelled" ? (
              <Notice tone="error" title="This order was cancelled">
                {data.order.vendor.name} could not make it. Any online payment
                is refunded.
              </Notice>
            ) : (
              <>
                <TrackMap tracking={data} />
                <Steps steps={data.steps} />
              </>
            )}

            {data.rider && data.order.status !== "cancelled" ? (
              <Card className="flex-row items-center gap-3.5 p-3.5">
                <Avatar
                  src={data.rider.avatar}
                  name={data.rider.name}
                  size="lg"
                />
                <View className="min-w-0 flex-1">
                  <Text variant="heading" className="text-base leading-[22px]">
                    {data.rider.name}
                  </Text>
                  <Text variant="meta">{`Your rider · ${data.rider.vehicle}`}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    void Linking.openURL(
                      `tel:${data.rider?.phone.replace(/\s/g, "")}`,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${data.rider.name}`}
                  className="h-11 w-11 items-center justify-center rounded-full border border-border bg-field"
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.foreground}
                  />
                </Pressable>
              </Card>
            ) : null}

            <Card className="overflow-hidden p-0">
              <Pressable
                onPress={() => nav.openChat(orderId)}
                accessibilityRole="button"
                className="min-h-16 flex-row items-center gap-3.5 border-b border-divider px-4 py-2.5 active:bg-muted"
              >
                <ShopLogo
                  uri={data.order.vendor.logo}
                  name={data.order.vendor.name}
                  size={40}
                />
                <View className="min-w-0 flex-1">
                  <Text
                    variant="heading"
                    numberOfLines={1}
                    className="text-base leading-[22px]"
                  >
                    {`Message ${data.order.vendor.name}`}
                  </Text>
                  <Text variant="meta">Ask about your order</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.subtle}
                />
              </Pressable>
              <Pressable
                onPress={() => setSummary(true)}
                accessibilityRole="button"
                className="min-h-16 flex-row items-center gap-3.5 px-4 py-2.5 active:bg-muted"
              >
                <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
                  <Ionicons
                    name="bag-handle-outline"
                    size={20}
                    color={colors["brand-text"]}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text variant="heading" className="text-base leading-[22px]">
                    Order summary
                  </Text>
                  <Text variant="meta">{data.itemsLabel}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.subtle}
                />
              </Pressable>
            </Card>
          </>
        )}
      </ScrollView>

      <BottomSheet
        visible={summary}
        onClose={() => setSummary(false)}
        title="Order summary"
        subtitle={
          detail ? `#${detail.code} · ${detail.vendor.name}` : undefined
        }
      >
        {detail ? (
          <View className="gap-3">
            <Card className="gap-0 p-0">
              {detail.items.map((item, index) => (
                <View
                  key={`${item.name}-${index}`}
                  className={cn(
                    "flex-row items-start justify-between gap-3 px-4 py-3",
                    index < detail.items.length - 1 &&
                      "border-b border-divider",
                  )}
                >
                  <View className="min-w-0 flex-1">
                    <Text className="font-sans-bold text-[15px]">
                      {item.name}
                    </Text>
                    <Text variant="meta" numberOfLines={2}>
                      {[item.variation, `Qty ${item.quantity}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                  <Text className="font-sans-bold text-[15px]">
                    {formatNaira(item.lineTotal)}
                  </Text>
                </View>
              ))}
            </Card>
            <Card className="gap-2.5">
              <Row label="Subtotal" value={formatNaira(detail.subtotal)} />
              <Row
                label="Delivery fee"
                value={formatNaira(detail.deliveryFee)}
              />
              <Row label="Discount" value={formatNaira(detail.discount)} />
              <View className="flex-row items-center justify-between border-t border-divider pt-2.5">
                <Text variant="heading" className="text-base">
                  Total
                </Text>
                <Text className="font-sans-extrabold text-xl">
                  {formatNaira(detail.total)}
                </Text>
              </View>
            </Card>
            <View className="min-h-12 flex-row items-center justify-between rounded-card border border-border bg-card px-4">
              <Text className="font-sans-semibold text-sm">Payment</Text>
              <Badge
                label={
                  detail.paymentType === "online"
                    ? detail.paymentStatus === "paid"
                      ? "Paid online"
                      : "Pay online"
                    : detail.paymentStatus === "paid"
                      ? "Paid in cash"
                      : "Cash on delivery"
                }
                variant={
                  detail.paymentStatus === "paid" ? "success" : "warning"
                }
              />
            </View>
            <Button variant="outline" onPress={() => setSummary(false)}>
              Close
            </Button>
          </View>
        ) : (
          <Skeleton className="h-40 rounded-card" />
        )}
      </BottomSheet>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-sans-medium text-[15px]">{label}</Text>
      <Text className="font-sans-bold text-[15px]">{value}</Text>
    </View>
  );
}
