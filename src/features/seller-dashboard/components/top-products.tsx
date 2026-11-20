import { useState } from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "~/components/ui/card";
import { SectionHeader } from "~/components/ui/section-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn, withApiBase } from "~/lib/utils/helpers";
import { formatNaira } from "../format";
import { useTopProducts } from "../hooks";
import type { TopProduct } from "../types";

function Thumb({ uri }: { uri: string | null }) {
  const colors = useThemeColors();
  const [failed, setFailed] = useState(false);
  const source = withApiBase(uri);

  return (
    <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-tint-border bg-tint">
      {source && !failed ? (
        <Image
          source={{ uri: source }}
          accessibilityIgnoresInvertColors
          style={{ width: 44, height: 44 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Ionicons name="image-outline" size={20} color={colors["brand-text"]} />
      )}
    </View>
  );
}

function Row({ product, last }: { product: TopProduct; last: boolean }) {
  return (
    <View
      className={cn(
        "min-h-16 flex-row items-center gap-3 px-4 py-2.5",
        !last && "border-b border-border",
      )}
    >
      <Thumb uri={product.thumbnail} />
      <View className="flex-1">
        <Text className="font-sans-bold text-[15px]" numberOfLines={1}>
          {product.name}
        </Text>
        <Text variant="caption" className="text-[13px]">
          {product.sales} sold
        </Text>
      </View>
      <Text className="font-sans-extrabold text-[15px]">
        {formatNaira(product.price)}
      </Text>
    </View>
  );
}

// Best sellers (top-12 endpoint, first 3 that have sales). Shown in place of
// the design's tiles that need data the API does not have. Hidden when empty
// or on error.
export function TopProducts({ title = "Top sellers" }: { title?: string }) {
  const query = useTopProducts();

  if (query.isError) return null;
  const top = (query.data ?? []).filter((p) => p.sales > 0).slice(0, 3);
  if (!query.isPending && top.length === 0) return null;

  return (
    <View className="gap-4">
      <SectionHeader title={title} />
      <Card className="overflow-hidden p-0">
        {query.isPending ? (
          <View className="gap-3 p-4">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </View>
        ) : (
          top.map((product, index) => (
            <Row
              key={product.id}
              product={product}
              last={index === top.length - 1}
            />
          ))
        )}
      </Card>
    </View>
  );
}
