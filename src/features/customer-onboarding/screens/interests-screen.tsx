import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { BackButton } from "~/components/ui/back-button";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useProfile, useSaveProfile } from "~/features/customer-account/hooks";
import { useCategories } from "~/features/customer-food/hooks";
import { SetupHeader } from "../components/setup-header";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  "Rice and stews": "restaurant-outline",
  Snacks: "ice-cream-outline",
  Drinks: "beer-outline",
  Bakery: "cafe-outline",
  "Fast food": "fast-food-outline",
  Healthy: "leaf-outline",
};

function InterestTile({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={SHADOWS.field}
      className={cn(
        "min-h-[104px] justify-between rounded-card border p-3.5 active:opacity-90",
        selected
          ? "border-[1.5px] border-primary bg-tint"
          : "border-border bg-card",
      )}
    >
      <View className="flex-row items-start justify-between">
        <View
          className={cn(
            "h-10 w-10 items-center justify-center rounded-tile",
            selected ? "bg-primary" : "bg-tint",
          )}
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              selected ? colors["primary-foreground"] : colors["brand-text"]
            }
          />
        </View>
        <View
          className={cn(
            "h-6 w-6 items-center justify-center rounded-full",
            selected ? "bg-primary" : "border-[1.5px] border-control",
          )}
        >
          {selected ? (
            <Ionicons
              name="checkmark"
              size={15}
              color={colors["primary-foreground"]}
            />
          ) : null}
        </View>
      </View>
      <Text className="font-sans-extrabold text-base">{label}</Text>
    </Pressable>
  );
}

// Set up 2 · Food you like. Also the "Food you like" row of the profile
// (`?edit=1`), where it saves and goes back instead of continuing the set-up.
export function InterestsScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const segments: string[] = useSegments();
  const editing = edit === "1" || segments[0] === "(tabs)";
  const categories = useCategories();
  const profile = useProfile();
  const save = useSaveProfile();
  const [picked, setPicked] = useState<number[] | null>(null);
  const selected = picked ?? profile.data?.interests ?? [];

  const toggle = (id: number) =>
    setPicked(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  const next = () => router.push("/setup/address");
  const submit = () =>
    save.mutate(
      { interests: selected },
      { onSuccess: () => (editing ? router.back() : next()) },
    );

  return (
    <View className="flex-1">
      <Screen contentContainerStyle={{ gap: 14 }}>
        {editing ? (
          <BackButton />
        ) : (
          <SetupHeader step={2} total={4} label="Food you like" onSkip={next} />
        )}
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            What do you like to eat?
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            Pick as many as you like. You can change this later.
          </Text>
        </View>

        {categories.isLoading ? (
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-28 w-[48%] rounded-card" />
            ))}
          </View>
        ) : categories.isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load food types"
            actionLabel="Try again"
            onAction={() => void categories.refetch()}
          />
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {categories.data?.map((category) => (
              <View key={category.id} className="w-[48.5%]">
                <InterestTile
                  label={category.name}
                  icon={ICONS[category.name] ?? "restaurant-outline"}
                  selected={selected.includes(category.id)}
                  onPress={() => toggle(category.id)}
                />
              </View>
            ))}
          </View>
        )}
      </Screen>
      <SetupFooter>
        <Button loading={save.isPending} onPress={submit}>
          {editing ? "Save" : "Continue"}
        </Button>
      </SetupFooter>
    </View>
  );
}
