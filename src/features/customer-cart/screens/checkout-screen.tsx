import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { Notice } from "~/components/ui/notice";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { MODE_LABEL } from "~/features/customer-food/components/vendor-row";
import { useFoodNav } from "~/features/customer-food/navigation";
import type { FulfilmentMode } from "~/features/customer-food/types";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { formatNaira, itemsLabel } from "~/lib/utils/format";
import { useCheckout, usePlaceOrder } from "../hooks";
import { useCheckoutStore } from "../store";
import type { PaymentChoice } from "../types";

function PayRow({
  title,
  subtitle,
  selected,
  last,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={cn(
        "min-h-16 flex-row items-center gap-3 px-4 py-3 active:bg-muted",
        !last && "border-b border-divider",
      )}
    >
      <View className="min-w-0 flex-1">
        <Text className="font-sans-bold text-base">{title}</Text>
        <Text variant="meta">{subtitle}</Text>
      </View>
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full border-[1.5px]",
          selected ? "border-primary" : "border-control",
        )}
      >
        {selected ? <View className="h-3 w-3 rounded-full bg-primary" /> : null}
      </View>
    </Pressable>
  );
}

// Checkout board: who you order from (with Edit back to the cart), Delivery /
// Pickup / Dine in, the delivery address with Change, the phone number,
// Payment (Pay online or Cash on delivery), the total and "Place order".
export function CheckoutScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const addressId = useCheckoutStore((s) => s.addressId);
  const [mode, setMode] = useState<FulfilmentMode>("delivery");
  const [payment, setPayment] = useState<PaymentChoice>("online");
  const [phone, setPhone] = useState<string | null>(null);

  const checkout = useCheckout({ vendorId: Number(vendorId), mode, addressId });
  const place = usePlaceOrder();
  const data = checkout.data;
  const phoneValue = phone ?? data?.phone ?? "";
  const delivery = mode === "delivery";
  const needsAddress = delivery && !data?.address;

  const submit = () => {
    if (!data) return;
    place.mutate(
      {
        vendorId: data.vendor.id,
        mode,
        addressId: delivery ? (data.address?.id ?? null) : null,
        phone: phoneValue,
        payment,
      },
      { onSuccess: (order) => nav.replaceWithPlaced(order.id) },
    );
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 28,
          paddingHorizontal: 20,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="headerTitle" className="flex-1 text-center">
            Checkout
          </Text>
          <View className="w-11" />
        </View>

        {checkout.isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-16 rounded-card" />
            <Skeleton className="h-12 rounded-pill" />
            <Skeleton className="h-16 rounded-card" />
            <Skeleton className="h-32 rounded-card" />
          </View>
        ) : checkout.isError || !data ? (
          <EmptyState
            icon="bag-outline"
            title="Nothing to check out"
            message="Your cart may have changed. Go back and try again."
            actionLabel="Back to cart"
            onAction={nav.openCart}
          />
        ) : (
          <>
            <Card className="flex-row items-center gap-3 p-3.5">
              <ShopLogo
                uri={data.vendor.logo}
                name={data.vendor.name}
                size={40}
              />
              <View className="min-w-0 flex-1">
                <Text variant="meta" className="text-xs">
                  Order from
                </Text>
                <Text
                  variant="heading"
                  numberOfLines={1}
                  className="text-base leading-[22px]"
                >
                  {data.vendor.name}
                </Text>
              </View>
              <Pressable
                onPress={() => nav.openCart()}
                accessibilityRole="button"
                className="min-h-11 justify-center"
              >
                <Text className="font-sans-bold text-[13px] text-brand-text underline">{`${itemsLabel(data.itemCount)} · Edit`}</Text>
              </Pressable>
            </Card>

            <SegmentedControl
              options={data.modes.map((m) => ({
                label: MODE_LABEL[m],
                value: m,
              }))}
              value={mode}
              onChange={(value) => setMode(value as FulfilmentMode)}
            />

            {delivery ? (
              data.address ? (
                <Card className="flex-row items-center gap-3 p-3.5">
                  <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={colors["brand-text"]}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="heading"
                      numberOfLines={1}
                      className="text-base leading-[22px]"
                    >
                      {data.address.label}
                    </Text>
                    <Text variant="meta" numberOfLines={2}>
                      {data.address.address}
                    </Text>
                  </View>
                  <Pressable
                    onPress={nav.openAddresses}
                    accessibilityRole="button"
                    className="min-h-11 justify-center"
                  >
                    <Text className="font-sans-bold text-[13px] text-brand-text underline">
                      Change
                    </Text>
                  </Pressable>
                </Card>
              ) : (
                <Pressable
                  onPress={nav.openAddresses}
                  accessibilityRole="button"
                  style={SHADOWS.field}
                  className="min-h-16 flex-row items-center gap-3 rounded-card border border-dashed border-primary bg-tint px-4"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={colors["brand-text"]}
                  />
                  <Text className="font-sans-bold text-base text-brand-text">
                    Add a delivery address
                  </Text>
                </Pressable>
              )
            ) : (
              <Notice tone="info">
                {mode === "pickup"
                  ? `Collect your order from ${data.vendor.name} when it is ready.`
                  : `Eat at ${data.vendor.name}. We will tell you when your table order is ready.`}
              </Notice>
            )}

            <Input
              label="Phone number"
              value={phoneValue}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone"
              startAdornment={
                <Ionicons name="call-outline" size={20} color={colors.hint} />
              }
            />

            <View className="gap-2.5">
              <Text variant="heading" className="text-[19px]">
                Payment
              </Text>
              <Card className="overflow-hidden p-0">
                <PayRow
                  title="Pay online"
                  subtitle="Card or bank transfer"
                  selected={payment === "online"}
                  onPress={() => setPayment("online")}
                />
                <PayRow
                  title={delivery ? "Cash on delivery" : "Pay in person"}
                  subtitle={
                    delivery
                      ? "Pay the rider when it arrives"
                      : "Pay at the vendor when you collect"
                  }
                  selected={payment === "cash"}
                  last
                  onPress={() => setPayment("cash")}
                />
              </Card>
            </View>

            <Card className="gap-2.5">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-medium text-[15px]">Subtotal</Text>
                <Text className="font-sans-bold text-[15px]">
                  {formatNaira(data.subtotal)}
                </Text>
              </View>
              {delivery ? (
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-medium text-[15px]">
                    Delivery fee
                  </Text>
                  <Text className="font-sans-bold text-[15px]">
                    {formatNaira(data.deliveryFee)}
                  </Text>
                </View>
              ) : null}
              {data.discount > 0 ? (
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-semibold text-[15px] text-success-text">
                    Discount
                  </Text>
                  <Text className="font-sans-bold text-[15px] text-success-text">{`-${formatNaira(data.discount)}`}</Text>
                </View>
              ) : null}
              <View className="flex-row items-center justify-between border-t border-divider pt-2.5">
                <Text variant="heading" className="text-lg">
                  Total
                </Text>
                <Text className="font-sans-extrabold text-xl">
                  {formatNaira(data.total)}
                </Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
      {data ? (
        <ActionBar>
          <Button
            disabled={needsAddress || phoneValue.trim().length < 7}
            loading={place.isPending}
            onPress={submit}
          >
            {needsAddress
              ? "Add an address to continue"
              : `Place order · ${formatNaira(data.total)}`}
          </Button>
        </ActionBar>
      ) : null}
    </View>
  );
}
