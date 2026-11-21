import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Notice } from "~/components/ui/notice";
import { QuantityStepper } from "~/components/ui/quantity-stepper";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import {
  isDifferentVendor,
  useAddToCart,
} from "~/features/customer-cart/hooks";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { formatNaira } from "~/lib/utils/format";
import { notifySuccess } from "~/lib/utils/toast";
import { useDish, useMenu, useToggleDishFavourite } from "../hooks";
import { MODE_LABEL } from "../components/vendor-row";
import type { Dish } from "../types";

function ChoiceRow({
  label,
  price,
  selected,
  kind,
  last,
  onPress,
}: {
  label: string;
  price: string;
  selected: boolean;
  kind: "radio" | "check";
  last?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={kind === "radio" ? "radio" : "checkbox"}
      accessibilityState={{ selected, checked: selected }}
      className={cn(
        "min-h-14 flex-row items-center gap-3 px-4 py-2.5 active:bg-muted",
        !last && "border-b border-divider",
      )}
    >
      {kind === "radio" ? (
        <View
          className={cn(
            "h-6 w-6 items-center justify-center rounded-full border-[1.5px]",
            selected ? "border-primary" : "border-control",
          )}
        >
          {selected ? (
            <View className="h-3 w-3 rounded-full bg-primary" />
          ) : null}
        </View>
      ) : (
        <View
          className={cn(
            "h-6 w-6 items-center justify-center rounded-checkbox",
            selected ? "bg-primary" : "border-[1.5px] border-control bg-field",
          )}
        >
          {selected ? (
            <Ionicons
              name="checkmark"
              size={16}
              color={colors["primary-foreground"]}
            />
          ) : null}
        </View>
      )}
      <Text className="min-w-0 flex-1 font-sans-bold text-[15px]">{label}</Text>
      <Text variant="meta" className="font-sans-semibold">
        {price}
      </Text>
    </Pressable>
  );
}

// Dish board: picture, name and price, description, prep time and modes, a Size
// choice, Add-ons and a pinned bar with the quantity stepper and
// "Add to cart · ₦3,300". Sold out, scheduled and closed-vendor dishes explain
// themselves and disable the button.
export function DishScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dishQuery = useDish(Number(id));
  const dish = dishQuery.data;

  return (
    <View className="flex-1">
      {dishQuery.isLoading ? (
        <View className="gap-3 px-5" style={{ paddingTop: insets.top + 12 }}>
          <Skeleton className="h-52 rounded-card" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-24 rounded-card" />
        </View>
      ) : dishQuery.isError || !dish ? (
        <View style={{ paddingTop: insets.top + 12 }} className="gap-3 px-5">
          <BackButton />
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load this dish"
            actionLabel="Try again"
            onAction={() => void dishQuery.refetch()}
          />
        </View>
      ) : (
        <DishContent key={dish.id} dish={dish} />
      )}
    </View>
  );
}

function DishContent({ dish }: { dish: Dish }) {
  const insets = useSafeAreaInsets();
  const favourite = useToggleDishFavourite();
  const add = useAddToCart();
  const menu = useMenu(dish.vendorId);
  const [sizeId, setSizeId] = useState<string | null>(
    dish.sizes[0]?.id ?? null,
  );
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const vendorOpen = menu.data?.vendor.isOpen ?? true;
  const size = dish.sizes.find((s) => s.id === sizeId);
  const base = size ? size.price : dish.price;
  const extras = dish.addOns
    .filter((a) => addOnIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = (base + extras) * quantity;
  const blocked =
    dish.status === "sold_out"
      ? "Sold out"
      : !vendorOpen
        ? "Vendor is closed"
        : null;

  const submit = (replace = false) =>
    add.mutate(
      { dishId: dish.id, sizeId, addOnIds, quantity, replace },
      {
        onSuccess: () => {
          notifySuccess({ message: "Added to cart" });
          if (router.canGoBack()) router.back();
        },
        onError: (error) => {
          const other = isDifferentVendor(error);
          if (other) {
            Alert.alert(
              "Start a new cart?",
              `Your cart has dishes from ${other}. Orders go to one vendor at a time, so adding this dish clears them.`,
              [
                { text: "Keep my cart", style: "cancel" },
                {
                  text: "Start new cart",
                  style: "destructive",
                  onPress: () => submit(true),
                },
              ],
            );
          }
        },
      },
    );

  return (
    <>
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="h-64 bg-tint-deep">
          {dish.image ? (
            <Image
              source={{ uri: dish.image }}
              resizeMode="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : null}
          <View
            style={{ top: insets.top + 12 }}
            className="absolute left-5 right-5 flex-row items-center justify-between"
          >
            <BackButton />
            <RoundIconButton
              icon={dish.isFavourite ? "heart" : "heart-outline"}
              label={
                dish.isFavourite
                  ? "Remove from favourites"
                  : "Add to favourites"
              }
              onPress={() => favourite.mutate(dish.id)}
            />
          </View>
        </View>

        <View className="gap-4 px-5 pt-5">
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text
                accessibilityRole="header"
                className="min-w-0 flex-1 font-sans-extrabold text-[24px] leading-[30px]"
              >
                {dish.name}
              </Text>
              <Text className="font-sans-extrabold text-[22px] leading-[30px]">
                {formatNaira(dish.sizes[0]?.price ?? dish.price)}
              </Text>
            </View>
            {dish.description ? (
              <Text
                tone="muted"
                className="font-sans-medium text-base leading-6"
              >
                {dish.description}
              </Text>
            ) : null}
            <View className="flex-row flex-wrap gap-1.5 pt-1">
              <Badge label={`${dish.prepMinutes} min prep`} variant="neutral" />
              {dish.modes
                .filter((m) => m !== "dine_in")
                .map((mode) => (
                  <Badge
                    key={mode}
                    label={MODE_LABEL[mode]}
                    variant="default"
                  />
                ))}
            </View>
          </View>

          {dish.status === "sold_out" ? (
            <Notice tone="error" title="Sold out">
              Mama&apos;s kitchen will add it back when it is ready again.
            </Notice>
          ) : dish.status === "scheduled" && dish.availableWindow ? (
            <Notice tone="warning" title={`Available ${dish.availableWindow}`}>
              You can order it during these hours.
            </Notice>
          ) : null}
          {!vendorOpen ? (
            <Notice tone="warning" title="This vendor is closed">
              Ordering is paused until it opens.
            </Notice>
          ) : null}

          {dish.sizes.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="heading" className="text-[19px]">
                Size
              </Text>
              <Card className="overflow-hidden p-0">
                {dish.sizes.map((s, i) => (
                  <ChoiceRow
                    key={s.id}
                    kind="radio"
                    label={s.label}
                    price={formatNaira(s.price)}
                    selected={sizeId === s.id}
                    last={i === dish.sizes.length - 1}
                    onPress={() => setSizeId(s.id)}
                  />
                ))}
              </Card>
            </View>
          ) : null}

          {dish.addOns.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="heading" className="text-[19px]">
                Add-ons
              </Text>
              <Card className="overflow-hidden p-0">
                {dish.addOns.map((a, i) => (
                  <ChoiceRow
                    key={a.id}
                    kind="check"
                    label={a.label}
                    price={`+${formatNaira(a.price)}`}
                    selected={addOnIds.includes(a.id)}
                    last={i === dish.addOns.length - 1}
                    onPress={() =>
                      setAddOnIds(
                        addOnIds.includes(a.id)
                          ? addOnIds.filter((x) => x !== a.id)
                          : [...addOnIds, a.id],
                      )
                    }
                  />
                ))}
              </Card>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <ActionBar>
        <View className="flex-row items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <View className="flex-1">
            <Button
              disabled={Boolean(blocked)}
              loading={add.isPending}
              onPress={() => submit()}
            >
              {blocked ?? `Add to cart · ${formatNaira(total)}`}
            </Button>
          </View>
        </View>
      </ActionBar>
    </>
  );
}
