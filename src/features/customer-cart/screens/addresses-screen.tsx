import { Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useAddresses } from "~/features/customer-account/hooks";
import { useFoodNav } from "~/features/customer-food/navigation";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { useCheckoutStore } from "../store";

// Delivery address board: the saved addresses as cards (name, address, a
// Default badge), "Tap an address to use it for this order." and Add address.
// Opened from Checkout it picks the address (`?select=1`); from the profile
// it manages them, and a tap opens the editor.
export function AddressesScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const nav = useFoodNav();
  const { select } = useLocalSearchParams<{ select?: string }>();
  const addresses = useAddresses();
  const setAddressId = useCheckoutStore((s) => s.setAddressId);
  const picking = select === "1" || nav.tab !== "profile";

  const onPick = (id: number) => {
    if (picking) {
      setAddressId(id);
      router.back();
    } else {
      nav.openAddressForm(id);
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 28,
          paddingHorizontal: 20,
          gap: 14,
        }}
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="headerTitle" className="flex-1 text-center">
            Delivery address
          </Text>
          <View className="w-11" />
        </View>

        {addresses.isLoading ? (
          <>
            <Skeleton className="h-[72px] rounded-card" />
            <Skeleton className="h-[72px] rounded-card" />
          </>
        ) : addresses.isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load your addresses"
            actionLabel="Try again"
            onAction={() => void addresses.refetch()}
          />
        ) : addresses.data && addresses.data.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title="No saved addresses"
            message="Add one and checkout is a single tap."
          />
        ) : (
          <>
            {addresses.data?.map((address) => (
              <Pressable
                key={address.id}
                onPress={() => onPick(address.id)}
                accessibilityRole="button"
                accessibilityLabel={`${address.label}, ${address.address}${address.isDefault ? ", default" : ""}`}
                style={SHADOWS.field}
                className="flex-row items-center gap-3.5 rounded-card border border-border bg-card p-3.5 active:opacity-90"
              >
                <View className="h-10 w-10 items-center justify-center rounded-tile bg-tint">
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors["brand-text"]}
                  />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text
                    variant="heading"
                    numberOfLines={1}
                    className="text-base leading-[22px]"
                  >
                    {address.label}
                  </Text>
                  <Text variant="meta" numberOfLines={2}>
                    {address.address}
                  </Text>
                </View>
                {address.isDefault ? (
                  <Badge label="Default" variant="success" />
                ) : null}
              </Pressable>
            ))}
            <Text variant="meta" className="text-[13px]">
              {picking
                ? "Tap an address to use it for this order."
                : "Tap an address to edit it."}
            </Text>
          </>
        )}
      </ScrollView>
      <ActionBar>
        <Button onPress={() => nav.openAddressForm()}>Add address</Button>
      </ActionBar>
    </View>
  );
}
