import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShopLogo } from "~/components/shop-logo";
import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import type { FulfilmentMode, VendorSummary } from "../types";

export const MODE_LABEL: Record<FulfilmentMode, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "Dine in",
};

/** The small "Delivery" / "Pickup" pills under a vendor name. */
export function ModePills({ modes }: { modes: FulfilmentMode[] }) {
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {modes
        .filter((mode) => mode !== "dine_in")
        .map((mode) => (
          <Badge key={mode} label={MODE_LABEL[mode]} variant="default" />
        ))}
    </View>
  );
}

/** "★ 4.7 · 20 min": one filled star (the rating), then the kitchen time. */
export function RatingLine({
  rating,
  minutes,
  extra,
}: {
  rating: number;
  minutes: number;
  extra?: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={13} color={colors.primary} />
      <Text variant="meta" className="font-sans-semibold text-foreground">
        {rating.toFixed(1)}
      </Text>
      <Text variant="meta">
        {`· ${minutes} min`}
        {extra ? ` · ${extra}` : ""}
      </Text>
    </View>
  );
}

interface VendorRowProps {
  vendor: VendorSummary;
  onPress: () => void;
}

// A vendor in a list (Home "Open now", Search "Vendors"): logo tile, name,
// rating and time, the Delivery / Pickup pills and a chevron. Closed vendors
// are dimmed and say when they open.
export function VendorRow({ vendor, onPress }: VendorRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${vendor.name}${vendor.isOpen ? "" : ", closed"}`}
      style={SHADOWS.field}
      className="flex-row items-center gap-3.5 rounded-card border border-border bg-card p-3.5 active:opacity-90"
    >
      <View className={cn(!vendor.isOpen && "opacity-60")}>
        <ShopLogo uri={vendor.logo} name={vendor.name} size={56} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text
          variant="heading"
          numberOfLines={1}
          className="text-base leading-[22px]"
        >
          {vendor.name}
        </Text>
        {vendor.isOpen ? (
          <>
            <RatingLine rating={vendor.rating} minutes={vendor.prepMinutes} />
            <ModePills modes={vendor.modes} />
          </>
        ) : (
          <>
            <RatingLine rating={vendor.rating} minutes={vendor.prepMinutes} />
            <Badge label={vendor.opensLabel ?? "Closed"} variant="neutral" />
          </>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subtle} />
    </Pressable>
  );
}
