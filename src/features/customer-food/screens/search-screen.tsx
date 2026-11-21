import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "~/components/ui/chip";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { SectionHeader } from "~/components/ui/section-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { DishRow } from "../components/dish-row";
import { VendorRow } from "../components/vendor-row";
import { useCategories, useSearch, useTrending } from "../hooks";
import { useFoodNav } from "../navigation";
import type { FulfilmentMode } from "../types";

const UNDER = 3000;

// Search board: the field, Delivery / Pickup / "Under ₦3,000" filter chips and
// the results in two sections, Dishes then Vendors. Before typing it suggests
// popular searches and the food types.
export function SearchScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<FulfilmentMode | null>(null);
  const [cheap, setCheap] = useState(false);
  const [category, setCategory] = useState<number | null>(null);

  // Wait for a pause in typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);

  const active =
    query.length > 0 || mode !== null || cheap || category !== null;
  const results = useSearch({
    q: query,
    mode,
    maxPrice: cheap ? UNDER : null,
    category,
  });
  const trending = useTrending();
  const categories = useCategories();

  const clear = () => {
    setText("");
    setQuery("");
    setMode(null);
    setCheap(false);
    setCategory(null);
  };

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 14,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        accessibilityRole="header"
        className="font-sans-extrabold text-[30px] leading-9 tracking-[-0.5px]"
      >
        Search
      </Text>

      <Input
        value={text}
        onChangeText={setText}
        placeholder="Search food or vendors"
        autoCorrect={false}
        returnKeyType="search"
        startAdornment={
          <Ionicons name="search" size={20} color={colors.hint} />
        }
        endAdornment={
          active ? (
            <Pressable
              onPress={clear}
              accessibilityLabel="Clear search"
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={20} color={colors.subtle} />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        className="grow-0"
      >
        <Chip
          label="Delivery"
          selected={mode === "delivery"}
          onPress={() => setMode(mode === "delivery" ? null : "delivery")}
        />
        <Chip
          label="Pickup"
          selected={mode === "pickup"}
          onPress={() => setMode(mode === "pickup" ? null : "pickup")}
        />
        <Chip
          label="Under ₦3,000"
          selected={cheap}
          onPress={() => setCheap(!cheap)}
        />
      </ScrollView>

      {!active ? (
        <View className="gap-5">
          <View className="gap-3">
            <SectionHeader title="Popular searches" />
            <View className="flex-row flex-wrap gap-2">
              {(trending.data ?? []).map((term) => (
                <Chip key={term} label={term} onPress={() => setText(term)} />
              ))}
            </View>
          </View>
          <View className="gap-3">
            <SectionHeader title="Food types" />
            <View className="flex-row flex-wrap gap-2">
              {(categories.data ?? []).map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  onPress={() => setCategory(c.id)}
                />
              ))}
            </View>
          </View>
        </View>
      ) : results.isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
        </View>
      ) : results.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Search isn't working"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void results.refetch()}
        />
      ) : results.data &&
        results.data.dishes.length === 0 &&
        results.data.vendors.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Nothing found"
          message="Try another word, or remove a filter."
          actionLabel="Clear search"
          onAction={clear}
        />
      ) : (
        <>
          {results.data && results.data.dishes.length > 0 ? (
            <View className="gap-3">
              <SectionHeader title="Dishes" />
              {results.data.dishes.map((dish) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  showVendor
                  onPress={() => nav.openDish(dish.id)}
                />
              ))}
            </View>
          ) : null}
          {results.data && results.data.vendors.length > 0 ? (
            <View className="gap-3">
              <SectionHeader title="Vendors" />
              {results.data.vendors.map((vendor) => (
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
