import { useState } from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

interface FoodThumbProps {
  uri?: string | null;
  /** Edge length of the square tile (or the width when `wide`). */
  size?: number;
  /** Full-width tile for cards; the height comes from `height`. */
  wide?: boolean;
  height?: number;
  radius?: number;
  dimmed?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}

// Dish picture on a peach tile. With no picture (or while it loads / fails) the
// tile shows the fork-and-bowl icon from the boards, so lists never jump.
export function FoodThumb({
  uri,
  size = 60,
  wide,
  height = 100,
  radius = 14,
  dimmed,
  icon = "restaurant-outline",
}: FoodThumbProps) {
  const colors = useThemeColors();
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = Boolean(uri) && failed !== uri;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        wide ? { width: "100%", height } : { width: size, height: size },
        { borderRadius: radius },
      ]}
      className={cn(
        "shrink-0 items-center justify-center overflow-hidden bg-tint-deep",
        dimmed && "opacity-55",
      )}
    >
      <Ionicons
        name={icon}
        size={wide ? 34 : size * 0.42}
        color={colors["brand-text"]}
      />
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          onError={() => setFailed(uri ?? null)}
          resizeMode="cover"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        />
      ) : null}
    </View>
  );
}
