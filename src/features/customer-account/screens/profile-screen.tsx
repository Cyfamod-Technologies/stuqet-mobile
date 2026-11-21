import { Alert, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useCustomerLogout } from "~/features/auth/customer-hooks";
import { useRiderProfile } from "~/features/rider-account/hooks";
import { vehicleTitle } from "~/features/rider-account/constants";
import { useRoleStore } from "~/lib/stores/role-store";
import { useThemeStore, type ThemePreference } from "~/lib/stores/theme-store";
import { useState } from "react";
import { useProfile } from "../hooks";
import { DemoTools } from "../components/demo-tools";

export const APPEARANCE_LABEL: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "Match my phone",
};

// Profile is the last tab of both roles. Customers (board): the account card,
// Delivery addresses, Food you like, Notifications, Appearance, Become a rider
// and Log out. Riders (board): their card with the Approved badge, Vehicle and
// documents, Payout details, Switch to ordering food, Notifications,
// Appearance and Log out.
export function ProfileScreen() {
  const role = useRoleStore((s) => s.role);
  return role === "rider" ? <RiderProfile /> : <CustomerProfile />;
}

function useConfirmLogout() {
  const logout = useCustomerLogout();
  const confirm = () =>
    Alert.alert(
      "Log out?",
      "You will need to sign in again to order or deliver.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => logout.mutate(),
        },
      ],
    );
  return { confirm, pending: logout.isPending };
}

function AppearanceRow({ last }: { last?: boolean }) {
  const preference = useThemeStore((s) => s.preference);
  return (
    <ListRow
      icon="color-palette-outline"
      title="Appearance"
      subtitle={APPEARANCE_LABEL[preference]}
      onPress={() => router.push("/(tabs)/profile/appearance")}
      last={last}
    />
  );
}

function CustomerProfile() {
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const setRole = useRoleStore((s) => s.setRole);
  const { confirm, pending } = useConfirmLogout();
  const data = profile.data;

  const riderStatus = data?.riderStatus ?? "none";
  const rider = {
    title:
      riderStatus === "approved"
        ? "Switch to rider"
        : riderStatus === "pending"
          ? "Rider application"
          : "Become a rider",
    subtitle:
      riderStatus === "approved"
        ? "Open your deliveries"
        : riderStatus === "pending"
          ? "Under review"
          : "Earn by delivering orders",
    onPress: () => {
      if (riderStatus === "approved") {
        setRole("rider");
        router.replace("/(tabs)/home");
      } else if (riderStatus === "pending") router.push("/rider-setup/review");
      else
        router.push({
          pathname: "/rider-setup/profile",
          params: { from: "profile" },
        });
    },
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
    >
      <ScreenHeader title="Profile" />
      {profile.isLoading ? (
        <Skeleton className="h-20 rounded-card" />
      ) : (
        <Card className="flex-row items-center gap-3.5 p-4">
          <Avatar src={data?.avatar} name={data?.name} size="lg" />
          <View className="min-w-0 flex-1">
            <Text variant="heading" numberOfLines={1} className="text-lg">
              {data?.name ?? "Your account"}
            </Text>
            <Text variant="meta" numberOfLines={1}>
              {data?.school ?? data?.email ?? ""}
            </Text>
          </View>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <ListRow
          icon="location-outline"
          title="Delivery addresses"
          onPress={() => router.push("/(tabs)/profile/addresses")}
        />
        <ListRow
          icon="restaurant-outline"
          title="Food you like"
          onPress={() => router.push("/(tabs)/profile/interests")}
        />
        <ListRow
          icon="notifications-outline"
          title="Notifications"
          onPress={() => router.push("/(tabs)/profile/notifications")}
          last
        />
      </Card>
      <Card className="overflow-hidden p-0">
        <AppearanceRow />
        <ListRow
          icon="bicycle-outline"
          title={rider.title}
          subtitle={rider.subtitle}
          onPress={rider.onPress}
          last
        />
      </Card>
      <Card className="overflow-hidden p-0">
        <ListRow
          icon="log-out-outline"
          title="Log out"
          danger
          last
          onPress={confirm}
          right={pending ? <Text variant="meta">…</Text> : undefined}
        />
      </Card>
      <DemoTools />
    </ScrollView>
  );
}

function RiderProfile() {
  const insets = useSafeAreaInsets();
  const profile = useRiderProfile();
  const setRole = useRoleStore((s) => s.setRole);
  const { confirm } = useConfirmLogout();
  const [switching, setSwitching] = useState(false);
  const data = profile.data;
  const payout = data?.payout;

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      <ScreenHeader title="Profile" />
      {profile.isLoading ? (
        <Skeleton className="h-20 rounded-card" />
      ) : (
        <Card className="flex-row items-center gap-3.5 p-4">
          <Avatar src={data?.avatar} name={data?.name} size="lg" />
          <View className="min-w-0 flex-1">
            <Text variant="heading" numberOfLines={1} className="text-lg">
              {data?.name ?? "Rider"}
            </Text>
            <Text variant="meta" numberOfLines={2}>
              {data ? `${vehicleTitle(data.vehicle)} · ${data.school}` : ""}
            </Text>
          </View>
          {data ? (
            <Badge
              label={data.status === "approved" ? "Approved" : "Pending"}
              variant={data.status === "approved" ? "success" : "warning"}
            />
          ) : null}
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <ListRow
          icon="bicycle-outline"
          title="Vehicle and documents"
          subtitle="Motorbike, ID and licence"
          onPress={() => router.push("/(tabs)/profile/vehicle")}
        />
        <ListRow
          icon="business-outline"
          title="Payout details"
          subtitle={
            payout
              ? `${payout.bankName} · ••••${payout.accountNumber.slice(-4)}`
              : "Add a bank account"
          }
          onPress={() => router.push("/(tabs)/profile/payout")}
          last
        />
      </Card>
      <Card className="overflow-hidden p-0">
        <ListRow
          icon="swap-horizontal-outline"
          title="Switch to ordering food"
          subtitle="Use Stuqet as a customer"
          onPress={() => setSwitching(true)}
        />
        <ListRow
          icon="notifications-outline"
          title="Notifications"
          onPress={() => router.push("/(tabs)/profile/notifications")}
        />
        <AppearanceRow last />
      </Card>
      <Card className="overflow-hidden p-0">
        <ListRow
          icon="log-out-outline"
          title="Log out"
          danger
          last
          onPress={confirm}
        />
      </Card>
      <DemoTools />

      <BottomSheet
        visible={switching}
        onClose={() => setSwitching(false)}
        title="Switch to ordering food?"
        subtitle="You will see the customer side of Stuqet. You can switch back here any time."
      >
        <View className="gap-3">
          <Button
            onPress={() => {
              setSwitching(false);
              setRole("customer");
              router.replace("/(tabs)/home");
            }}
          >
            Switch
          </Button>
          <Button variant="outline" onPress={() => setSwitching(false)}>
            Stay as rider
          </Button>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}
