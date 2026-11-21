import { useMemo, useState } from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";

export interface SelectOption {
  value: string;
  /** Shown in the field once chosen. */
  label: string;
  /** Shown in the sheet row (defaults to `label`); categories indent it. */
  rowLabel?: string;
}

interface OptionSelectFieldProps {
  /** Field label, also the sheet title unless `sheetTitle` is given. */
  label: string;
  sheetTitle?: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  /** Options are still being fetched (field shows a skeleton). */
  loading?: boolean;
  /** Options failed to load: tapping the field retries instead of opening. */
  loadFailed?: boolean;
  onRetry?: () => void;
  loadFailedText?: string;
  /** In-sheet search appears once the list is longer than this (0 = never). */
  searchAfter?: number;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

// A select field that opens a list sheet (CategorySheet / ServiceTypeSheet /
// PriceTypeSheet on the boards): 16px rows, the chosen one extra bold with a
// tick, no search unless the list is long.
export function OptionSelectField({
  label,
  sheetTitle,
  value,
  options,
  onChange,
  placeholder,
  error,
  loading,
  loadFailed,
  onRetry,
  loadFailedText = "Couldn't load the list. Tap to retry",
  searchAfter = 0,
  searchPlaceholder = "Search",
  emptyTitle = "Nothing to choose from",
  emptyMessage,
}: OptionSelectFieldProps) {
  const colors = useThemeColors();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value);
  const searchable = searchAfter > 0 && options.length > searchAfter;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? options.filter((o) => o.label.toLowerCase().includes(needle))
      : options;
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  if (loading) {
    return (
      <View className="gap-1.5">
        <Text variant="label">{label}</Text>
        <Skeleton className="h-field rounded-field" />
      </View>
    );
  }

  return (
    <View className="gap-1.5">
      <Text variant="label">{label}</Text>
      <Pressable
        onPress={() => (loadFailed ? onRetry?.() : setOpen(true))}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selected ? selected.label : "not chosen"}`}
        accessibilityHint={
          loadFailed
            ? "Could not load the list. Double tap to retry"
            : undefined
        }
        style={SHADOWS.field}
        className={cn(
          "min-h-field flex-row items-center justify-between gap-3 rounded-field border bg-field px-4",
          error || loadFailed ? "border-destructive" : "border-border",
        )}
      >
        <Text
          className={cn("flex-1 font-sans-medium", !selected && "text-hint")}
          numberOfLines={1}
        >
          {loadFailed ? loadFailedText : (selected?.label ?? placeholder)}
        </Text>
        <Ionicons
          name={loadFailed ? "refresh" : "chevron-down"}
          size={18}
          color={colors["muted-foreground"]}
        />
      </Pressable>
      {error ? (
        <Text className="font-sans-medium text-xs text-destructive-text">
          {error}
        </Text>
      ) : null}

      <BottomSheet visible={open} onClose={close} title={sheetTitle ?? label}>
        {searchable ? (
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            accessibilityLabel={searchPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : null}
        <View style={{ maxHeight: height * 0.6 }}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
            ListEmptyComponent={
              <EmptyState
                icon="albums-outline"
                title={query ? "No match" : emptyTitle}
                message={query ? "Try a different word." : emptyMessage}
              />
            }
            renderItem={({ item, index }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: isSelected }}
                  className={cn(
                    "min-h-[52px] flex-row items-center gap-3 px-1 py-1.5 active:bg-muted",
                    index < filtered.length - 1 && "border-b border-border",
                  )}
                >
                  <Text
                    className={cn(
                      "flex-1 text-base leading-[22px]",
                      isSelected ? "font-sans-extrabold" : "font-sans-semibold",
                    )}
                  >
                    {item.rowLabel ?? item.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors["brand-text"]}
                    />
                  ) : (
                    <View className="h-[22px] w-[22px]" />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
