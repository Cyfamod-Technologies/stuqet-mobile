import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";

interface StarRatingProps {
  /** 0 to 5. Fractions round to the nearest whole star. */
  value: number;
  /** Makes the stars tappable (rating form). */
  onChange?: (value: number) => void;
  size?: number;
  gap?: number;
}

// Five stars: the active ones are filled brand orange, the rest are outlined
// (never a grey fill). With `onChange` each star is a 44px touch target.
export function StarRating({
  value,
  onChange,
  size = 16,
  gap = 2,
}: StarRatingProps) {
  const colors = useThemeColors();
  const filled = Math.round(value);

  return (
    <View
      accessibilityRole={onChange ? "adjustable" : "image"}
      accessibilityLabel={`${filled} out of 5 stars`}
      style={{ flexDirection: "row", alignItems: "center", gap }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= filled;
        const icon = (
          <Ionicons
            name={active ? "star" : "star-outline"}
            size={size}
            color={active ? colors.primary : colors.subtle}
          />
        );
        return onChange ? (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            accessibilityRole="button"
            accessibilityLabel={`${star} ${star === 1 ? "star" : "stars"}`}
            hitSlop={6}
            className="min-h-11 min-w-9 items-center justify-center"
          >
            {icon}
          </Pressable>
        ) : (
          <View key={star}>{icon}</View>
        );
      })}
    </View>
  );
}
