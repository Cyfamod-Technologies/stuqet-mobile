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
import { useProductCategories } from "../hooks";

/** Show the in-sheet search box once the list gets long. */
const SEARCH_THRESHOLD = 12;

interface CategoryFieldProps {
  /** Selected category id as a string ("" when none). */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

// Single-select category picker: a field that opens a bottom sheet with the
// flattened tree (children indented). Handles loading, error and empty states.
export function CategoryField({
  value,
  onChange,
  label = "Category",
  error,
}: CategoryFieldProps) {
  const colors = useThemeColors();
  const { height } = useWindowDimensions();
  const { data: options, isLoading, isError, refetch } = useProductCategories();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options?.find((option) => String(option.id) === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? (options ?? []).filter((o) => o.name.toLowerCase().includes(needle))
      : (options ?? []);
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  if (isLoading) {
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
        onPress={() => (isError ? void refetch() : setOpen(true))}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selected ? selected.name : "not chosen"}`}
        accessibilityHint={
          isError ? "Could not load categories. Double tap to retry" : undefined
        }
        style={SHADOWS.field}
        className={cn(
          "min-h-field flex-row items-center justify-between rounded-field border bg-field px-4",
          error || isError ? "border-destructive" : "border-border",
        )}
      >
        <Text
          className={cn(
            "flex-1 font-sans-medium",
            !selected && "text-hint",
          )}
          numberOfLines={1}
        >
          {isError
            ? "Couldn't load categories. Tap to retry"
            : (selected?.name ?? "Choose a category")}
        </Text>
        <Ionicons
          name={isError ? "refresh" : "chevron-down"}
          size={18}
          color={colors["muted-foreground"]}
        />
      </Pressable>
      {error ? (
        <Text className="font-sans-medium text-xs text-destructive-text">
          {error}
        </Text>
      ) : null}

      <BottomSheet visible={open} onClose={close} title={label}>
        {(options?.length ?? 0) > SEARCH_THRESHOLD ? (
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search categories"
            accessibilityLabel="Search categories"
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : null}
        <View style={{ maxHeight: height * 0.5 }}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
            ListEmptyComponent={
              <EmptyState
                icon="albums-outline"
                title={query ? "No matching category" : "No categories yet"}
                message={
                  query
                    ? "Try a different word."
                    : "Categories are added by the Stuqet team."
                }
              />
            }
            renderItem={({ item }) => {
              const isSelected = String(item.id) === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(String(item.id));
                    close();
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={item.name}
                  accessibilityState={{ selected: isSelected }}
                  className="min-h-12 flex-row items-center justify-between gap-3 border-b border-border px-1 py-2.5 active:bg-muted"
                >
                  <Text
                    className={cn(
                      "flex-1 text-base",
                      isSelected
                        ? "font-sans-bold text-brand-text"
                        : "font-sans-medium",
                    )}
                  >
                    {item.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
