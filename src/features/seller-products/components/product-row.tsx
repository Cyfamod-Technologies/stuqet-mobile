import { memo, useState } from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Toggle } from "~/components/ui/toggle";
import type { SellerProduct } from "../types";
import { availabilityLine, formatListPrice, rowBadge } from "../utils";

interface ProductRowProps {
  product: SellerProduct;
  onTogglePublished: (product: SellerProduct, next: boolean) => void;
  /** True while this row's publish request is in flight. */
  busy?: boolean;
}

// One catalogue row: thumbnail, name, price + stock/approval badge, and the
// Published switch. Food rows add the availability line.
function ProductRowBase({ product, onTogglePublished, busy }: ProductRowProps) {
  const colors = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);
  const badge = rowBadge(product);
  const isFood = product.listing_type === "food";
  const showImage = Boolean(product.thumbnail_img) && !imageFailed;

  return (
    <Card
      style={SHADOWS.field}
      className="flex-row items-center gap-3 rounded-[20px] p-3"
    >
      <View className="h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[14px] border border-tint-border bg-tint">
        {showImage ? (
          <Image
            source={{ uri: product.thumbnail_img }}
            className="h-full w-full"
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons
            name={isFood ? "restaurant-outline" : "image-outline"}
            size={25}
            color={colors["brand-text"]}
          />
        )}
      </View>

      <View className="min-w-0 flex-1 gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="shrink font-sans-bold text-base leading-5"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          {product.featured ? (
            <Ionicons
              name="star"
              size={14}
              color={colors.primary}
              accessibilityLabel="Featured"
            />
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Text
            className="shrink font-sans-extrabold text-base"
            numberOfLines={1}
          >
            {formatListPrice(product.price)}
          </Text>
          <Badge
            label={badge.label}
            variant={badge.tone}
            className={badge.tone === "outline" ? "bg-secondary" : undefined}
            textClassName={cn(
              "font-sans-bold leading-[14px]",
              badge.tone === "outline" && "text-foreground",
            )}
          />
        </View>
        {isFood ? (
          <Text tone="muted" className="font-sans-medium text-[13px] leading-4">
            {availabilityLine(product)}
          </Text>
        ) : null}
      </View>

      <View className="items-end gap-2">
        <Text variant="caption" className="font-sans-semibold">
          Published
        </Text>
        <Toggle
          value={product.status}
          onValueChange={(next) => onTogglePublished(product, next)}
          disabled={busy}
          label={`Published, ${product.name}`}
        />
      </View>
    </Card>
  );
}

export const ProductRow = memo(ProductRowBase);
