import type { ReactElement, ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import type { LaravelPage } from "../types";

type EmptyIcon = React.ComponentProps<typeof EmptyState>["icon"];

interface HistoryListProps<T> {
  query: UseInfiniteQueryResult<InfiniteData<LaravelPage<T>>, Error>;
  /** Title, balance card and tabs; scrolls with the list. */
  header: ReactElement;
  renderRow: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  empty: { icon: EmptyIcon; title: string; message: string };
  /** Extra work on pull-to-refresh (e.g. refetch the balance). */
  onRefresh?: () => void;
  contentTop: number;
  contentBottom: number;
}

// One card-like list: rows share a single rounded white container, the way
// the Money design draws them, while the FlatList keeps paging and recycling.
export function HistoryList<T>({
  query,
  header,
  renderRow,
  keyExtractor,
  empty,
  onRefresh,
  contentTop,
  contentBottom,
}: HistoryListProps<T>) {
  const colors = useThemeColors();
  const items = query.data?.pages.flatMap((page) => page.data) ?? [];
  const refreshing = query.isRefetching && !query.isFetchingNextPage;

  const body = query.isPending ? (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className={cn(
            "min-h-16 flex-row items-center gap-3 px-4 py-2.5",
            i < 2 && "border-b border-border",
          )}
        >
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </View>
          <Skeleton className="h-4 w-16" />
        </View>
      ))}
    </View>
  ) : query.isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title="Couldn't load this list"
      message="Check your connection and try again."
      actionLabel="Try again"
      onAction={() => query.refetch()}
    />
  ) : (
    <EmptyState icon={empty.icon} title={empty.title} message={empty.message} />
  );

  return (
    <FlatList
      data={query.isPending || query.isError ? [] : items}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <View className="gap-4 pb-4">
          {header}
          {items.length === 0 ? body : null}
        </View>
      }
      renderItem={({ item, index }) => (
        <View
          className={cn(
            "border-x border-b border-border bg-card",
            index === 0 && "rounded-t-2xl border-t",
            index === items.length - 1 && "rounded-b-2xl",
          )}
        >
          {renderRow(item)}
        </View>
      )}
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <View className="py-4">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : undefined
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            query.refetch();
            onRefresh?.();
          }}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{
        paddingTop: contentTop,
        paddingBottom: contentBottom,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
      className="flex-1"
    />
  );
}
