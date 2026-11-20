import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "~/lib/colors";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { ScreenHeader } from "~/components/ui/screen-header";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { LISTING_LABELS } from "../constants";
import {
  useCatalogueCounts,
  useChangeProductStatus,
  useDebouncedValue,
  useSellerProducts,
} from "../hooks";
import type { ListingType, SellerProduct } from "../types";
import {
  FOOD_FILTERS,
  PRODUCT_FILTERS,
  catalogueSummary,
  matchesFoodFilter,
  matchesProductFilter,
  type FoodFilter,
  type ProductFilter,
} from "../utils";
import { AddChooserSheet } from "./add-chooser-sheet";
import { Chip } from "./chip";
import { ProductRow } from "./product-row";

const TABS = (Object.keys(LISTING_LABELS) as ListingType[]).map((value) => ({
  value,
  label: LISTING_LABELS[value].tab,
}));

// Space under the list so the last row clears the floating Add button.
const LIST_BOTTOM_PADDING = 112;

export function CatalogueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { add } = useLocalSearchParams<{ add?: string }>();

  const [type, setType] = useState<ListingType>("product");
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim());
  // TODO(backend): these filters run on the loaded pages only (no server
  // params yet), see utils.ts.
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");
  const [foodFilter, setFoodFilter] = useState<FoodFilter>("all");
  const [chooserOpen, setChooserOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // "Add another" on the saved screen comes back here asking for the chooser.
  useEffect(() => {
    if (add === "1") {
      setChooserOpen(true);
      router.setParams({ add: "" });
    }
  }, [add, router]);

  const list = useSellerProducts(type, search);
  const counts = useCatalogueCounts();
  const { mutate: changeStatus, isPending, variables } =
    useChangeProductStatus();

  const labels = LISTING_LABELS[type];
  const filter = type === "product" ? productFilter : foodFilter;
  const filtersActive = filter !== "all";

  const items = useMemo(() => {
    const all = list.data?.pages.flatMap((page) => page.data) ?? [];
    if (type === "product") {
      return all.filter((p) => matchesProductFilter(p, productFilter));
    }
    return all.filter((p) => matchesFoodFilter(p, foodFilter));
  }, [list.data, type, productFilter, foodFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([list.refetch(), counts.refetch()]);
    setRefreshing(false);
  }, [list, counts]);

  const onEndReached = () => {
    if (list.hasNextPage && !list.isFetchingNextPage && !list.isError) {
      void list.fetchNextPage();
    }
  };

  const onTogglePublished = useCallback(
    (product: SellerProduct, next: boolean) =>
      changeStatus({ id: product.id, status: next }),
    [changeStatus],
  );

  const goToForm = (target: ListingType) => {
    setChooserOpen(false);
    router.push(
      target === "product" ? "/catalogue/add-product" : "/catalogue/add-food",
    );
  };

  const changeTab = (value: string) => {
    setType(value as ListingType);
    setSearchText("");
  };

  const renderEmpty = () => {
    if (list.isLoading) {
      return (
        <View className="gap-4" accessibilityLabel="Loading your catalogue">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[84px] rounded-[20px]" />
          ))}
        </View>
      );
    }
    if (list.isError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your catalogue"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void list.refetch()}
        />
      );
    }
    // A client-side filter over partial data: keep loading before giving up.
    if (filtersActive && list.hasNextPage) {
      return (
        <View className="items-center py-10">
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (search) {
      return (
        <EmptyState
          icon="search-outline"
          title="No results"
          message={`Nothing in ${labels.plural} matches “${search}”.`}
        />
      );
    }
    if (filtersActive) {
      return (
        <EmptyState
          icon="funnel-outline"
          title="Nothing here"
          message={`No ${labels.plural} match this filter.`}
        />
      );
    }
    return (
      <EmptyState
        icon={type === "product" ? "cube-outline" : "restaurant-outline"}
        title={`No ${labels.plural} yet`}
        message={`Add your first ${labels.singular} and it will show up here.`}
        actionLabel={`Add ${labels.singular}`}
        onAction={() => goToForm(type)}
      />
    );
  };

  const renderFooter = () => {
    if (list.isFetchingNextPage) {
      return (
        <View className="items-center py-4">
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (list.isFetchNextPageError) {
      return (
        <View className="items-center py-3">
          <Button
            variant="soft"
            size="sm"
            onPress={() => void list.fetchNextPage()}
          >
            Couldn't load more. Retry
          </Button>
        </View>
      );
    }
    return null;
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="gap-4 px-5 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <ScreenHeader
          title="Catalogue"
          subtitle={catalogueSummary(counts.products, counts.food)}
        />

        <SegmentedControl options={TABS} value={type} onChange={changeTab} />

        <View>
          <View
            pointerEvents="none"
            className="absolute left-4 top-0 z-10 h-field justify-center"
          >
            <Ionicons
              name="search"
              size={20}
              color={colors["muted-foreground"]}
            />
          </View>
          <Input
            value={searchText}
            onChangeText={setSearchText}
            placeholder={labels.search}
            accessibilityLabel={labels.search}
            className="pl-8"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            endAdornment={
              searchText ? (
                <Pressable
                  onPress={() => setSearchText("")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.hint}
                  />
                </Pressable>
              ) : undefined
            }
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 grow-0"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          accessibilityRole="tablist"
        >
          {type === "product"
            ? PRODUCT_FILTERS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={productFilter === option.value}
                  onPress={() => setProductFilter(option.value)}
                />
              ))
            : FOOD_FILTERS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={foodFilter === option.value}
                  onPress={() => setFoodFilter(option.value)}
                />
              ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            onTogglePublished={onTogglePublished}
            busy={isPending && variables?.id === item.id}
          />
        )}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingBottom: LIST_BOTTOM_PADDING,
        }}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <Button
        onPress={() => setChooserOpen(true)}
        icon={<Ionicons name="add" size={26} color={colors["primary-foreground"]} />}
        className="absolute bottom-5 right-5 min-h-[60px] pl-[18px] pr-6"
      >
        Add
      </Button>

      <AddChooserSheet
        visible={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onChoose={goToForm}
      />
    </View>
  );
}
