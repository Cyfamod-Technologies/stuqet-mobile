import { useRouter } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";
import { SectionHeader } from "~/components/ui/section-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { useOrderCount } from "~/features/seller-orders/hooks";
import type { ShopInfo } from "~/features/seller-shop/types";
import { HOME_LINKS } from "../constants";

// "Needs your attention": new orders waiting to be confirmed (one order opens
// its details directly) and shop verification when it has not been submitted.
export function AttentionList({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const colors = useThemeColors();
  const pending = useOrderCount("pending");

  const rows: {
    key: string;
    icon: React.ComponentProps<typeof ListRow>["icon"];
    title: string;
    subtitle: string;
    onPress: () => void;
  }[] = [];

  const pendingCount = pending.data?.count ?? 0;
  if (pendingCount > 0) {
    const latestId = pending.data?.latestId ?? null;
    rows.push({
      key: "pending",
      icon: "receipt-outline",
      title:
        pendingCount === 1
          ? "1 new order to confirm"
          : `${pendingCount} new orders to confirm`,
      subtitle: "Tap to review",
      onPress: () =>
        pendingCount === 1 && latestId !== null
          ? router.push({
              pathname: "/orders/[id]",
              params: { id: String(latestId) },
            })
          : router.navigate({
              pathname: "/orders",
              params: { status: "pending", t: String(Date.now()) },
            }),
    });
  }

  if (!shop.verified && !shop.is_submitted_form) {
    rows.push({
      key: "verify",
      icon: "shield-checkmark-outline",
      title: "Verify your shop",
      subtitle: "Required to get the verified badge",
      onPress: () => router.push(HOME_LINKS.verification),
    });
  }

  return (
    <View className="gap-4">
      <SectionHeader title="Needs your attention" />
      {pending.isPending && rows.length === 0 ? (
        <Card className="gap-2 p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-28" />
        </Card>
      ) : rows.length > 0 ? (
        <Card className="overflow-hidden p-0">
          {rows.map((row, index) => (
            <ListRow
              key={row.key}
              icon={row.icon}
              title={row.title}
              subtitle={row.subtitle}
              onPress={row.onPress}
              last={index === rows.length - 1}
            />
          ))}
        </Card>
      ) : (
        <Card className="flex-row items-center gap-3 px-4 py-3.5">
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors["success-text"]}
          />
          <View className="flex-1">
            <Text variant="heading" className="text-base">
              You&apos;re all caught up
            </Text>
            <Text variant="caption" className="text-[13px]">
              Nothing needs your attention right now.
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
}
