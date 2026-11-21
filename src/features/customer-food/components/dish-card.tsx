import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOWS } from "~/lib/colors";
import { formatNaira } from "~/lib/utils/format";
import type { DishSummary } from "../types";
import { FoodThumb } from "./food-thumb";

// "Popular near you" card (Home): picture, name (two lines) and price.
export function DishCard({
  dish,
  onPress,
  width = 160,
}: {
  dish: DishSummary;
  onPress: () => void;
  width?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dish.name}, ${formatNaira(dish.price)}`}
      style={[SHADOWS.field, { width }]}
      className="gap-2.5 rounded-card border border-border bg-card p-2.5 active:opacity-90"
    >
      <FoodThumb wide uri={dish.image} height={104} radius={14} />
      <View className="gap-0.5 px-1 pb-1">
        <Text
          variant="heading"
          numberOfLines={2}
          className="min-h-10 text-[15px] leading-5"
        >
          {dish.name}
        </Text>
        <Text className="font-sans-extrabold text-[15px]">
          {formatNaira(dish.price)}
        </Text>
      </View>
    </Pressable>
  );
}
