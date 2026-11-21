import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Chip } from "~/components/ui/chip";
import { EmptyState } from "~/components/ui/empty-state";
import { Notice } from "~/components/ui/notice";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useCart } from "~/features/customer-cart/hooks";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { formatNaira, itemsLabel } from "~/lib/utils/format";
import { DishRow } from "../components/dish-row";
import { ModePills, RatingLine } from "../components/vendor-row";
import { useMenu, useToggleVendorFavourite } from "../hooks";
import { useFoodNav } from "../navigation";

// Vendor board: back, name and heart, cover with the logo tile, rating line and
// Delivery / Pickup pills, section chips (Meals, Sides, Drinks), the dishes and
// a pinned "View cart" bar once the cart has something from this vendor.
export function RestaurantScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vendorId = Number(id);
  const menu = useMenu(vendorId);
  const cart = useCart();
  const favourite = useToggleVendorFavourite();
  const [section, setSection] = useState<string | null>(null);

  const vendor = menu.data?.vendor;
  const sections = menu.data?.sections ?? [];
  const active = sections.find((s) => s.id === section) ?? sections[0];
  const group = cart.data?.groups.find((g) => g.vendor.id === vendorId);
  const count = group?.items.length ?? 0;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: count > 0 ? 110 : 32,
          gap: 14,
        }}
      >
        <View className="flex-row items-center gap-3 px-5">
          <BackButton />
          <Text
            variant="headerTitle"
            numberOfLines={1}
            className="flex-1 text-center"
          >
            {vendor?.name ?? ""}
          </Text>
          {vendor ? (
            <RoundIconButton
              icon={vendor.isFavourite ? "heart" : "heart-outline"}
              label={
                vendor.isFavourite
                  ? "Remove from favourites"
                  : "Add to favourites"
              }
              onPress={() => favourite.mutate(vendor.id)}
            />
          ) : (
            <View className="w-11" />
          )}
        </View>

        {menu.isLoading ? (
          <View className="gap-3 px-5">
            <Skeleton className="h-28 rounded-card" />
            <Skeleton className="h-20 rounded-card" />
            <Skeleton className="h-24 rounded-card" />
            <Skeleton className="h-24 rounded-card" />
          </View>
        ) : menu.isError || !vendor ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load this menu"
            message="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => void menu.refetch()}
          />
        ) : (
          <>
            <View className="px-5">
              <View className="h-28 overflow-hidden rounded-card bg-tint-deep">
                {vendor.cover ? (
                  <Image
                    source={{ uri: vendor.cover }}
                    resizeMode="cover"
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : null}
              </View>
              <View className="-mt-9 flex-row items-end gap-3.5 px-3.5">
                <View
                  style={SHADOWS.field}
                  className="rounded-[22px] border-2 border-card bg-card"
                >
                  <ShopLogo uri={vendor.logo} name={vendor.name} size={72} />
                </View>
                <View className="min-w-0 flex-1 gap-1.5 pb-1 pt-10">
                  <RatingLine
                    rating={vendor.rating}
                    minutes={vendor.prepMinutes}
                    extra={vendor.school}
                  />
                  <ModePills modes={vendor.modes} />
                </View>
              </View>
            </View>

            {!vendor.isOpen ? (
              <View className="px-5">
                <Notice tone="warning" title="Closed right now">
                  {vendor.opensLabel ?? "Check back later"}. You can browse the
                  menu, but ordering is paused.
                </Notice>
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
              className="grow-0"
            >
              {sections.map((s) => (
                <Chip
                  key={s.id}
                  label={s.name}
                  selected={active?.id === s.id}
                  onPress={() => setSection(s.id)}
                />
              ))}
            </ScrollView>

            <View className="gap-3 px-5">
              {active?.dishes.map((dish) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  closed={!vendor.isOpen}
                  onPress={() => nav.openDish(dish.id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {count > 0 && group ? (
        <View
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0"
        >
          <ActionBar>
            <Pressable
              onPress={nav.openCart}
              accessibilityRole="button"
              style={SHADOWS.button}
              className="min-h-button flex-row items-center justify-between rounded-pill bg-primary px-6 active:opacity-90"
            >
              <View className="flex-row items-center gap-2.5">
                <Ionicons
                  name="bag-outline"
                  size={20}
                  color={colors["primary-foreground"]}
                />
                <Text className="font-sans-bold text-[17px] text-primary-foreground">
                  {`View cart · ${itemsLabel(count)}`}
                </Text>
              </View>
              <Text className="font-sans-extrabold text-[17px] text-primary-foreground">
                {formatNaira(group.subtotal)}
              </Text>
            </Pressable>
          </ActionBar>
        </View>
      ) : null}
    </View>
  );
}
