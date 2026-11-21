import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShopLogo } from "~/components/shop-logo";
import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { formatNaira } from "~/lib/utils/format";
import type { DishSummary } from "../types";
import { FoodThumb } from "./food-thumb";

interface DishRowProps {
  dish: DishSummary;
  onPress: () => void;
  /** Search shows "Mama T Kitchen · 20 min" under the name; a menu does not. */
  showVendor?: boolean;
  /** The vendor is closed: dimmed, no + button (the dish still opens). */
  closed?: boolean;
}

// A dish in a list (menu, search results): picture tile, name, optional vendor
// line, status badge (Sold out, or the hours of a scheduled dish), price and
// the round + button. Sold out dishes are dimmed and have no + button.
export function DishRow({ dish, onPress, showVendor, closed }: DishRowProps) {
  const colors = useThemeColors();
  const soldOut = dish.status === "sold_out";
  const unavailable = soldOut || Boolean(closed);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dish.name}${soldOut ? ", sold out" : ""}, ${formatNaira(dish.price)}`}
      style={SHADOWS.field}
      className="flex-row items-center gap-3.5 rounded-card border border-border bg-card p-3 active:opacity-90"
    >
      <FoodThumb uri={dish.image} size={64} dimmed={unavailable} />
      <View className={cn("min-w-0 flex-1 gap-1", unavailable && "opacity-60")}>
        <Text
          variant="heading"
          numberOfLines={2}
          className="text-base leading-[22px]"
        >
          {dish.name}
        </Text>
        {showVendor ? (
          <View className="flex-row items-center gap-1.5">
            <ShopLogo uri={dish.vendorLogo} name={dish.vendorName} size={24} />
            <Text variant="meta" numberOfLines={1} className="flex-1">
              {`${dish.vendorName} · ${dish.prepMinutes} min`}
            </Text>
          </View>
        ) : null}
        {soldOut ? <Badge label="Sold out" variant="destructive" /> : null}
        {dish.status === "scheduled" && dish.availableWindow ? (
          <Badge label={dish.availableWindow} variant="warning" />
        ) : null}
        <Text className="font-sans-extrabold text-[15px]">
          {formatNaira(dish.price)}
        </Text>
      </View>
      {unavailable ? null : (
        <View
          style={SHADOWS.button}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary"
        >
          <Ionicons name="add" size={22} color={colors["primary-foreground"]} />
        </View>
      )}
    </Pressable>
  );
}
