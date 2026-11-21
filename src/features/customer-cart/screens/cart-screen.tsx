import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoFill } from "~/components/demo-fill";
import { ShopLogo } from "~/components/shop-logo";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Input } from "~/components/ui/input";
import { QuantityStepper } from "~/components/ui/quantity-stepper";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { FoodThumb } from "~/features/customer-food/components/food-thumb";
import { goHome, useFoodNav } from "~/features/customer-food/navigation";
import { getApiMessage } from "~/features/auth/errors";
import { useThemeColors } from "~/lib/colors";
import { formatNaira } from "~/lib/utils/format";
import {
  useApplyCoupon,
  useCart,
  useRemoveCartItem,
  useRemoveCoupon,
  useRemoveVendorGroup,
  useUpdateCartItem,
} from "../hooks";
import type { CartGroup } from "../types";

function TextLink({
  icon,
  label,
  onPress,
}: {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={6}
      className="min-h-9 flex-row items-center gap-1.5"
    >
      {icon ? (
        <Ionicons name={icon} size={15} color={colors["brand-text"]} />
      ) : null}
      <Text className="font-sans-bold text-[13px] text-brand-text underline">
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text
        className={
          tone === "success"
            ? "font-sans-semibold text-[15px] text-success-text"
            : "font-sans-medium text-[15px]"
        }
      >
        {label}
      </Text>
      <Text
        className={
          tone === "success"
            ? "font-sans-bold text-[15px] text-success-text"
            : "font-sans-bold text-[15px]"
        }
      >
        {value}
      </Text>
    </View>
  );
}

function GroupCard({
  group,
  showCheckout,
}: {
  group: CartGroup;
  showCheckout: boolean;
}) {
  const colors = useThemeColors();
  const nav = useFoodNav();
  const update = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const removeGroup = useRemoveVendorGroup();
  const apply = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [demoValid, setDemoValid] = useState(false);

  const note = group.items.find((item) => item.note)?.note ?? null;

  const confirmRemoveGroup = () =>
    Alert.alert(
      "Remove everything?",
      `Clear your ${group.vendor.name} dishes from the cart.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeGroup.mutate(group.vendor.id),
        },
      ],
    );

  const submitCoupon = () => {
    const value = code.trim();
    if (!value) {
      setCouponError("Enter a code first.");
      return;
    }
    setCouponError(null);
    apply.mutate(
      { vendorId: group.vendor.id, code: value },
      {
        onSuccess: () => setCode(""),
        onError: (error) =>
          setCouponError(
            getApiMessage(error) ??
              "That code is not valid or has expired. Check the spelling and try again.",
          ),
      },
    );
  };

  const saveNote = () => {
    const first = group.items[0];
    if (first) update.mutate({ id: first.id, note: noteText.trim() || null });
    setNoteOpen(false);
  };

  const fillCoupon = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { customerSamples } =
      require("~/demo/customer") as typeof import("~/demo/customer");
    setCode(
      demoValid ? customerSamples.coupon.valid : customerSamples.coupon.invalid,
    );
    setDemoValid((v) => !v);
    setCouponError(null);
  };

  return (
    <View className="gap-3.5">
      <View className="flex-row items-center gap-3">
        <ShopLogo uri={group.vendor.logo} name={group.vendor.name} size={40} />
        <View className="min-w-0 flex-1">
          <Text
            variant="heading"
            numberOfLines={1}
            className="text-base leading-[22px]"
          >
            {group.vendor.name}
          </Text>
          <Text variant="meta" numberOfLines={1}>
            {`Prep ${group.vendor.prepMinutes} min · Arrives in about ${group.vendor.arriveMinutes} min`}
          </Text>
        </View>
        <View className="items-end">
          <TextLink
            label="View menu"
            onPress={() => nav.openRestaurant(group.vendor.id)}
          />
          <TextLink label="Remove" onPress={confirmRemoveGroup} />
        </View>
      </View>

      <Card className="gap-0 p-0">
        {group.items.map((item, index) => (
          <View
            key={item.id}
            className={`flex-row gap-3 p-3.5 ${index < group.items.length - 1 ? "border-b border-divider" : ""}`}
          >
            <View className="items-start gap-1">
              <FoodThumb uri={item.image} size={60} />
              <TextLink
                label="Remove"
                onPress={() => removeItem.mutate(item.id)}
              />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text
                variant="heading"
                numberOfLines={3}
                className="text-[15px] leading-5"
              >
                {item.name}
              </Text>
              {item.variation ? (
                <Text variant="meta" numberOfLines={3}>
                  {item.variation}
                </Text>
              ) : null}
              <View className="mt-1 flex-row items-center justify-between">
                <View>
                  <Text className="font-sans-extrabold text-base">
                    {formatNaira(item.lineTotal)}
                  </Text>
                  {item.quantity > 1 ? (
                    <Text
                      variant="meta"
                      className="text-xs"
                    >{`${formatNaira(item.unitPrice)} each`}</Text>
                  ) : null}
                </View>
                <QuantityStepper
                  value={item.quantity}
                  min={1}
                  onChange={(quantity) =>
                    update.mutate({ id: item.id, quantity })
                  }
                />
              </View>
            </View>
          </View>
        ))}
        <View className="flex-row items-center justify-between border-t border-divider px-3.5 py-1.5">
          <TextLink
            icon="create-outline"
            label={note ? "Edit note" : "Add a note"}
            onPress={() => {
              setNoteText(note ?? "");
              setNoteOpen(true);
            }}
          />
          <TextLink
            icon="add"
            label="Add more items"
            onPress={() => nav.openRestaurant(group.vendor.id)}
          />
        </View>
        {note ? (
          <Text variant="meta" className="px-3.5 pb-3">
            {`Note: ${note}`}
          </Text>
        ) : null}
      </Card>

      <View className="gap-2">
        <Text className="font-sans-semibold text-sm">Coupon code</Text>
        {group.coupon ? (
          <>
            <View className="min-h-12 flex-row items-center gap-2.5 rounded-field border border-success-border bg-success-tint px-3.5">
              <Ionicons
                name="checkmark"
                size={18}
                color={colors["success-text"]}
              />
              <Text className="flex-1 font-sans-bold text-[15px] text-success-text">{`${group.coupon.code} applied`}</Text>
              <TextLink
                label="Remove"
                onPress={() => removeCoupon.mutate(group.vendor.id)}
              />
            </View>
            <Text
              variant="caption"
              tone="success"
              className="font-sans-semibold text-[13px]"
            >
              {group.coupon.message}
            </Text>
          </>
        ) : (
          <>
            <DemoFill
              label={demoValid ? "Fill a valid code" : "Fill a wrong code"}
              onFill={
                process.env.EXPO_PUBLIC_DEMO_MODE === "true"
                  ? fillCoupon
                  : undefined
              }
            />
            <View className="flex-row items-start gap-2.5">
              <View className="flex-1">
                <Input
                  value={code}
                  onChangeText={(t) => {
                    setCode(t.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Enter code"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  error={couponError ?? undefined}
                  startAdornment={
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color={colors.hint}
                    />
                  }
                />
              </View>
              <Button
                size="sm"
                className="mt-1"
                loading={apply.isPending}
                onPress={submitCoupon}
              >
                Apply
              </Button>
            </View>
            {!couponError ? (
              <Text variant="meta" className="text-[13px]">
                Have a code from the vendor or Stuqet? One code per order.
              </Text>
            ) : null}
          </>
        )}
      </View>

      <Card className="gap-3">
        <SummaryRow label="Subtotal" value={formatNaira(group.subtotal)} />
        <SummaryRow
          label="Delivery fee (estimate)"
          value={formatNaira(group.deliveryFee)}
        />
        {group.coupon ? (
          <SummaryRow
            tone="success"
            label={`Discount (${group.coupon.code})`}
            value={`-${formatNaira(group.discount)}`}
          />
        ) : null}
        <View className="-mx-4 -mb-4 flex-row items-center justify-between rounded-b-card bg-tint px-4 py-3.5">
          <Text variant="heading" className="text-lg">
            Total
          </Text>
          <Text className="font-sans-extrabold text-[22px]">
            {formatNaira(group.total)}
          </Text>
        </View>
      </Card>
      <View className="flex-row items-start gap-2 px-1">
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors["muted-foreground"]}
        />
        <Text variant="meta" className="flex-1 text-[13px]">
          The delivery fee is confirmed at checkout, based on your address.
        </Text>
      </View>
      {showCheckout ? (
        <Button
          onPress={() => nav.openCheckout(group.vendor.id)}
        >{`Checkout · ${formatNaira(group.total)}`}</Button>
      ) : null}

      <BottomSheet
        visible={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add a note"
        subtitle="Tell the kitchen anything that helps."
      >
        <Input
          value={noteText}
          onChangeText={setNoteText}
          placeholder="Extra pepper, no onions..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 72 }}
        />
        <Button onPress={saveNote}>Save note</Button>
      </BottomSheet>
    </View>
  );
}

// Cart board: a header, then per vendor the dishes with quantity steppers, a
// note, the coupon field (applied and error states), the totals and a pinned
// Checkout bar. An empty cart offers "Browse food" and "See your orders".
export function CartScreen() {
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const cart = useCart();
  const groups = cart.data?.groups ?? [];
  const single = groups.length === 1 ? groups[0] : null;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 28,
          paddingHorizontal: 20,
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="headerTitle" className="flex-1 text-center">
            Cart
          </Text>
          <View className="w-11" />
        </View>

        {cart.isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-12 rounded-card" />
            <Skeleton className="h-44 rounded-card" />
            <Skeleton className="h-24 rounded-card" />
          </View>
        ) : cart.isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load your cart"
            message="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => void cart.refetch()}
          />
        ) : groups.length === 0 ? (
          <View className="items-center gap-3 pt-10">
            <HeroBadge icon="bag-outline" />
            <Text
              accessibilityRole="header"
              className="mt-6 text-center font-sans-extrabold text-[26px] leading-8"
            >
              Your cart is empty
            </Text>
            <Text
              tone="muted"
              className="text-center font-sans-medium text-base leading-6"
            >
              Pick a dish from a vendor and it will show up here.
            </Text>
            <View className="mt-3 items-center gap-1">
              <Button className="px-10" onPress={goHome}>
                Browse food
              </Button>
              <Pressable
                onPress={() => router.replace("/(tabs)/orders")}
                accessibilityRole="link"
                className="min-h-11 justify-center"
              >
                <Text className="font-sans-bold text-[15px] text-brand-text underline">
                  See your orders
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.vendor.id}
              group={group}
              showCheckout={!single}
            />
          ))
        )}
      </ScrollView>
      {single ? (
        <ActionBar>
          <View className="flex-row items-center gap-4">
            <View>
              <Text variant="meta" className="text-xs">
                Total
              </Text>
              <Text className="font-sans-extrabold text-xl">
                {formatNaira(single.total)}
              </Text>
            </View>
            <View className="flex-1">
              <Button onPress={() => nav.openCheckout(single.vendor.id)}>
                Checkout
              </Button>
            </View>
          </View>
        </ActionBar>
      ) : null}
    </View>
  );
}
