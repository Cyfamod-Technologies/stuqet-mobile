import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ShopLogo } from "~/components/shop-logo";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { withApiBase } from "~/lib/utils/helpers";
import { useUnreadNotificationCount } from "~/features/seller-notifications/hooks";
import type { ShopInfo } from "~/features/seller-shop/types";
import { greeting } from "../format";

// Avatar tile + greeting + shop name (with a verified shield) + the bell that
// opens Notifications. An orange dot on the bell means unread notifications.
export function HomeHeader({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const colors = useThemeColors();
  const unread = useUnreadNotificationCount();

  return (
    <View className="flex-row items-center gap-3">
      <ShopLogo uri={withApiBase(shop.logo)} name={shop.name} size={56} />
      <View className="flex-1">
        <Text variant="caption" className="font-sans-medium text-sm">
          {greeting()}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text
            className="shrink font-sans-extrabold text-xl leading-[26px]"
            numberOfLines={1}
          >
            {shop.name}
          </Text>
          {shop.verified ? (
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={colors["success-text"]}
              accessibilityLabel="Verified shop"
            />
          ) : null}
        </View>
      </View>
      <RoundIconButton
        icon="notifications-outline"
        label={
          (unread.data ?? 0) > 0
            ? "Notifications, you have unread notifications"
            : "Notifications"
        }
        dot={(unread.data ?? 0) > 0}
        onPress={() => router.push("/notifications")}
      />
    </View>
  );
}
