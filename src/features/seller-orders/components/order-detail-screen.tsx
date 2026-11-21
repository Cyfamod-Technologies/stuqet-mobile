import { useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "~/components/screen";
import { ActionBar } from "~/components/ui/action-bar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Notice } from "~/components/ui/notice";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { notifyError } from "~/lib/utils/toast";
import {
  useMarkOrderPaid,
  useOrderDetail,
  useUpdateDeliveryStatus,
} from "../hooks";
import type { DeliveryStatus, OrderDetail, OrderItem } from "../types";
import {
  canMarkAsPaid,
  formatOrderDate,
  isOrderLocked,
  isPositiveMoney,
} from "../utils";
import { OrderStepper } from "./order-stepper";
import { DeliveryStatusBadge, PaymentStatusBadge } from "./status-badge";
import { StatusSheet } from "./status-sheet";

function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View
      className={
        strong
          ? "flex-row items-center justify-between px-4 py-3"
          : "flex-row items-center justify-between px-4 py-2.5"
      }
    >
      <Text
        className={
          strong
            ? "font-sans-extrabold text-[17px]"
            : "font-sans-medium text-[15px] text-muted-foreground"
        }
      >
        {label}
      </Text>
      <Text
        className={
          strong
            ? "font-sans-extrabold text-xl"
            : "font-sans-extrabold text-[15px]"
        }
      >
        {value}
      </Text>
    </View>
  );
}

function ItemRow({ item }: { item: OrderItem }) {
  const colors = useThemeColors();
  const detail = [item.variation, `Qty ${item.quantity}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
      {/* The API sends no product image for order items, so a tile stands in. */}
      <View className="h-12 w-12 items-center justify-center rounded-[14px] border border-tint-border bg-tint">
        <Ionicons name="image-outline" size={22} color={colors["brand-text"]} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-bold text-[15px] leading-[19px]">
          {item.name}
        </Text>
        <Text variant="caption" className="text-[13px] leading-4">
          {detail}
        </Text>
      </View>
      <Text className="font-sans-extrabold text-[15px]">{item.price}</Text>
    </View>
  );
}

function CustomerCard({ order }: { order: OrderDetail }) {
  const colors = useThemeColors();
  const { customer } = order;

  const call = async () => {
    if (!customer.phone) return;
    try {
      await Linking.openURL(`tel:${customer.phone.replace(/[^0-9+]/g, "")}`);
    } catch {
      notifyError({ message: "Couldn't open the phone app on this device." });
    }
  };

  return (
    <Card className="gap-2.5 px-4 py-3.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-sans-extrabold text-[17px]">
          {customer.name}
        </Text>
        <DeliveryStatusBadge status={order.deliveryStatus} />
      </View>
      {customer.address ? (
        <View className="flex-row items-start gap-2.5">
          <Ionicons
            name="location-outline"
            size={18}
            color={colors["muted-foreground"]}
          />
          <Text variant="caption" className="flex-1 text-sm leading-5">
            {customer.address}
          </Text>
        </View>
      ) : null}
      {customer.phone ? (
        <View className="flex-row items-center gap-2.5">
          <Ionicons
            name="call-outline"
            size={18}
            color={colors["muted-foreground"]}
          />
          <Text className="font-sans-semibold text-sm">{customer.phone}</Text>
          <Pressable
            onPress={call}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Call ${customer.name}`}
            className="ml-auto min-h-11 justify-center"
          >
            <Text variant="link" className="underline">
              Call
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <View className="gap-3.5">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
    </View>
  );
}

// Order details: progress, customer + address, items with totals, payment. The
// pinned bar opens the status sheet; delivered/cancelled orders are locked.
export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const colors = useThemeColors();

  const query = useOrderDetail(orderId);
  const updateStatus = useUpdateDeliveryStatus();
  const markPaid = useMarkOrderPaid();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pulling, setPulling] = useState(false);

  const order = query.data;
  const locked = order ? isOrderLocked(order.deliveryStatus) : false;

  const saveStatus = (status: DeliveryStatus) => {
    setSheetOpen(false);
    updateStatus.mutate({ orderId, status });
  };

  const confirmPaid = () => {
    Alert.alert(
      "Mark as paid?",
      "Confirm that you have received the payment for this order.",
      [
        { text: "Not yet", style: "cancel" },
        { text: "Mark as paid", onPress: () => markPaid.mutate(orderId) },
      ],
    );
  };

  const refresh = () => {
    setPulling(true);
    query.refetch().finally(() => setPulling(false));
  };

  const header = <ScreenHeader back title="Order details" />;

  let body;
  if (query.isPending) {
    body = <DetailSkeleton />;
  } else if (query.isError || !order) {
    body = (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load this order"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => query.refetch()}
      />
    );
  } else {
    const showMarkPaid = canMarkAsPaid(
      order.paymentStatus,
      order.paymentMethod,
    );
    body = (
      <>
        <Text
          variant="label"
          tone="muted"
          className="text-center font-sans-bold"
          accessibilityRole="header"
        >
          #{order.code} · {formatOrderDate(order.date)}
        </Text>

        {order.deliveryStatus === "cancelled" ? (
          <Notice tone="error" title="This order was cancelled">
            It can&apos;t be changed again.
          </Notice>
        ) : (
          <Card className="p-0">
            <OrderStepper status={order.deliveryStatus} />
          </Card>
        )}

        <CustomerCard order={order} />

        <Card className="overflow-hidden p-0">
          {order.items.map((item, index) => (
            <ItemRow key={`${item.name}-${index}`} item={item} />
          ))}
          <TotalRow label="Sub total" value={order.subtotal} />
          {isPositiveMoney(order.couponDiscount) ? (
            <TotalRow label="Discount" value={`-${order.couponDiscount}`} />
          ) : null}
          <TotalRow label="Tax" value={order.tax} />
          <TotalRow label="Shipping" value={order.shipping} />
          <TotalRow label="Total" value={order.total} strong />
        </Card>

        <Card className="gap-3 p-0 py-3.5">
          <View className="flex-row items-center justify-between gap-2.5 px-4">
            <View className="flex-1 gap-0.5">
              <Text variant="caption" className="text-[13px]">
                Payment method
              </Text>
              <Text className="font-sans-bold text-base">
                {order.paymentLabel}
              </Text>
            </View>
            <PaymentStatusBadge status={order.paymentStatus} />
          </View>
          {showMarkPaid ? (
            <View className="px-4">
              <Button
                variant="outline"
                size="sm"
                loading={markPaid.isPending}
                onPress={confirmPaid}
              >
                Mark as paid
              </Button>
            </View>
          ) : null}
        </Card>

        {locked ? (
          <Notice tone="info">
            {order.deliveryStatus === "delivered"
              ? "Delivered orders are locked and cannot be changed again."
              : "Cancelled orders are locked and cannot be changed again."}
          </Notice>
        ) : null}
      </>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        contentContainerStyle={{ gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={pulling}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {header}
        {body}
      </Screen>
      {order && !locked ? (
        <ActionBar>
          <Button onPress={() => setSheetOpen(true)}>Update status</Button>
        </ActionBar>
      ) : null}
      {order ? (
        <StatusSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          current={order.deliveryStatus}
          onSave={saveStatus}
        />
      ) : null}
    </View>
  );
}
