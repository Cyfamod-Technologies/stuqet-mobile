import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopLogo } from "~/components/shop-logo";
import { Chip } from "~/components/ui/chip";
import { EmptyState } from "~/components/ui/empty-state";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { SectionHeader } from "~/components/ui/section-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { useRoleStore } from "~/lib/stores/role-store";
import { RiderHomeScreen } from "~/features/rider-deliveries/screens/rider-home-screen";
import { useHome } from "../hooks";
import { useFoodNav } from "../navigation";
import { DishCard } from "../components/dish-card";
import { VendorRow } from "../components/vendor-row";

// Home is the first tab of both roles: riders see their dashboard, customers
// the food home.
export function HomeScreen() {
  const role = useRoleStore((s) => s.role);
  return role === "rider" ? <RiderHomeScreen /> : <CustomerHomeScreen />;
}

function HomeSkeleton() {
  return (
    <View className="gap-4">
      <Skeleton className="h-12 rounded-field" />
      <View className="flex-row gap-3">
        <Skeleton className="h-52 flex-1 rounded-card" />
        <Skeleton className="h-52 flex-1 rounded-card" />
      </View>
      <Skeleton className="h-24 rounded-card" />
      <Skeleton className="h-24 rounded-card" />
    </View>
  );
}

// Customer Home board: school pill + bell + cart, "What are you craving?",
// search, category chips, "Popular near you" cards and the "Open now" vendors.
function CustomerHomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const home = useHome();
  const [category, setCategory] = useState<number | null>(null);

  const data = home.data;
  const selected =
    data?.categories.find((c) => c.id === category)?.name ?? null;
  const vendors = (data?.vendors ?? []).filter(
    (v) => !selected || v.categories.includes(selected),
  );
  const open = vendors.filter((v) => v.isOpen);
  const closed = vendors.filter((v) => !v.isOpen);
  const popular = (data?.popular ?? []).filter(
    (dish) => !selected || vendors.some((v) => v.id === dish.vendorId),
  );

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={home.isRefetching && !home.isLoading}
          onRefresh={() => void home.refetch()}
        />
      }
    >
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={nav.openSchool}
          accessibilityRole="button"
          accessibilityLabel={`School: ${data?.school ?? ""}. Change school`}
          style={SHADOWS.field}
          className="h-11 min-w-0 flex-1 flex-row items-center gap-2 rounded-full border border-border bg-field px-3.5 active:opacity-90"
        >
          <Ionicons
            name="location-outline"
            size={18}
            color={colors["brand-text"]}
          />
          <Text numberOfLines={1} className="flex-1 font-sans-bold text-[15px]">
            {data?.school ?? "Choose your school"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors["muted-foreground"]}
          />
        </Pressable>
        <RoundIconButton
          icon="notifications-outline"
          label="Notifications"
          dot={(data?.unreadNotifications ?? 0) > 0}
          onPress={nav.openNotifications}
        />
        <View>
          <RoundIconButton
            icon="bag-outline"
            label="Cart"
            onPress={nav.openCart}
          />
          {(data?.cartCount ?? 0) > 0 ? (
            <View
              pointerEvents="none"
              className="absolute -right-1 -top-1 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1"
            >
              <Text className="font-sans-bold text-[11px] leading-[14px] text-primary-foreground">
                {data?.cartCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text
        accessibilityRole="header"
        className="font-sans-extrabold text-[30px] leading-9 tracking-[-0.5px]"
      >
        What are you craving?
      </Text>

      <Pressable
        onPress={() => router.push("/(tabs)/search")}
        accessibilityRole="search"
        accessibilityLabel="Search food or vendors"
        style={SHADOWS.field}
        className="h-12 flex-row items-center gap-2.5 rounded-field border border-border bg-field px-4"
      >
        <Ionicons name="search" size={20} color={colors.hint} />
        <Text className="font-sans-medium text-base text-hint">
          Search food or vendors
        </Text>
      </Pressable>

      {home.isLoading ? (
        <HomeSkeleton />
      ) : home.isError || !data ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load food"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void home.refetch()}
        />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 20 }}
            className="-mx-5 grow-0"
            contentInset={{ left: 20 }}
            style={{ marginHorizontal: -20 }}
          >
            <View style={{ width: 12 }} />
            <Chip
              label="All"
              selected={category === null}
              onPress={() => setCategory(null)}
            />
            {data.categories.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </ScrollView>

          {data.favourites.length > 0 && category === null ? (
            <View className="gap-3">
              <SectionHeader title="Your favourites" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14 }}
              >
                {data.favourites.map((vendor) => (
                  <Pressable
                    key={vendor.id}
                    onPress={() => nav.openRestaurant(vendor.id)}
                    accessibilityRole="button"
                    accessibilityLabel={vendor.name}
                    className="w-[72px] items-center gap-1.5"
                  >
                    <ShopLogo uri={vendor.logo} name={vendor.name} size={56} />
                    <Text
                      numberOfLines={1}
                      className="font-sans-semibold text-xs"
                    >
                      {vendor.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {popular.length > 0 ? (
            <View className="gap-3">
              <SectionHeader
                title="Popular near you"
                actionLabel="See all"
                onAction={() => router.push("/(tabs)/search")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 6 }}
                style={{ marginHorizontal: -20 }}
                contentInset={{ left: 20, right: 20 }}
              >
                <View style={{ width: 8 }} />
                {popular.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onPress={() => nav.openDish(dish.id)}
                  />
                ))}
                <View style={{ width: 8 }} />
              </ScrollView>
            </View>
          ) : null}

          <View className="gap-3">
            <SectionHeader title="Open now" />
            {open.length === 0 ? (
              <EmptyState
                icon="restaurant-outline"
                title="Nothing open here yet"
                message={
                  selected
                    ? `No ${selected.toLowerCase()} vendors are open right now.`
                    : "Check back soon."
                }
                actionLabel={selected ? "Show everything" : undefined}
                onAction={() => setCategory(null)}
              />
            ) : (
              open.map((vendor) => (
                <VendorRow
                  key={vendor.id}
                  vendor={vendor}
                  onPress={() => nav.openRestaurant(vendor.id)}
                />
              ))
            )}
          </View>

          {closed.length > 0 ? (
            <View className="gap-3">
              <SectionHeader title="Closed for now" />
              {closed.map((vendor) => (
                <VendorRow
                  key={vendor.id}
                  vendor={vendor}
                  onPress={() => nav.openRestaurant(vendor.id)}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
