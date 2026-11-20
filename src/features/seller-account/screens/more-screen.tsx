import { Alert, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "~/components/screen";
import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Text } from "~/components/ui/text";
import { useLogout } from "~/features/auth/hooks";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import {
  ProfileCard,
  ProfileCardSkeleton,
  verificationStatus,
  type VerificationStatus,
} from "../components/profile-card";

const VERIFICATION_SUBTITLE: Record<VerificationStatus, string> = {
  verified: "Your shop is verified",
  review: "Documents under review",
  unverified: "Submit your documents",
};

export function MoreScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const shop = useShopInfo();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const confirmLogout = () =>
    Alert.alert(
      "Log out?",
      "You will need to sign in again to manage your shop.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: () => logout() },
      ],
    );

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={shop.isRefetching}
          onRefresh={() => {
            void shop.refetch();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <ScreenHeader title="More" />

      {shop.isPending ? (
        <ProfileCardSkeleton />
      ) : shop.isError ? (
        <Card className="gap-1 p-4">
          <Text variant="heading" className="text-base">
            Couldn&apos;t load your shop
          </Text>
          <Pressable
            onPress={() => shop.refetch()}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text variant="link">Try again</Text>
          </Pressable>
        </Card>
      ) : (
        <ProfileCard shop={shop.data} />
      )}

      <Card className="overflow-hidden p-0">
        <ListRow
          icon="storefront-outline"
          title="Shop settings"
          subtitle="Name, logo, phone, address"
          onPress={() => router.push("/(tabs)/more/shop-settings")}
        />
        <ListRow
          icon="shield-checkmark-outline"
          title="Verification"
          subtitle={
            shop.data
              ? VERIFICATION_SUBTITLE[verificationStatus(shop.data)]
              : undefined
          }
          onPress={() => router.push("/(tabs)/more/verification")}
        />
        <ListRow
          icon="card-outline"
          title="Payout details"
          subtitle="Bank account and payment options"
          onPress={() => router.push("/(tabs)/more/payout")}
          last
        />
      </Card>

      <Card className="overflow-hidden p-0">
        <ListRow
          icon="notifications-outline"
          title="Notifications"
          onPress={() => router.push("/notifications")}
        />
        <ListRow
          icon="color-palette-outline"
          title="Appearance"
          subtitle="Light or dark theme"
          onPress={() => router.push("/(tabs)/more/settings")}
          last
        />
      </Card>

      <Card className="overflow-hidden p-0">
        <ListRow
          icon="log-out-outline"
          title="Log out"
          danger
          right={null}
          onPress={loggingOut ? undefined : confirmLogout}
          last
        />
      </Card>
    </Screen>
  );
}
