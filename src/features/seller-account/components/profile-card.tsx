import { View } from "react-native";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import type { ShopInfo } from "~/features/seller-shop/types";
import { ShopLogo } from "~/components/shop-logo";

export type VerificationStatus = "verified" | "review" | "unverified";

export function verificationStatus(shop: ShopInfo): VerificationStatus {
  if (shop.verified) return "verified";
  return shop.is_submitted_form ? "review" : "unverified";
}

const BADGES = {
  verified: { label: "Verified", variant: "success" },
  review: { label: "Under review", variant: "default" },
  unverified: { label: "Not verified", variant: "warning" },
} as const;

export function ProfileCard({ shop }: { shop: ShopInfo }) {
  const badge = BADGES[verificationStatus(shop)];
  const hasLogo = Boolean(shop.upload_id) && shop.upload_id !== "0";

  return (
    <Card className="flex-row items-center gap-3.5 p-4">
      <ShopLogo name={shop.name} uri={hasLogo ? shop.logo : null} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="heading" className="text-[19px]" numberOfLines={1}>
          {shop.name}
        </Text>
        <Text tone="muted" className="text-sm" numberOfLines={1}>
          {shop.email}
        </Text>
      </View>
      <Badge label={badge.label} variant={badge.variant} />
    </Card>
  );
}

export function ProfileCardSkeleton() {
  return (
    <Card className="flex-row items-center gap-3.5 p-4">
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </View>
    </Card>
  );
}
