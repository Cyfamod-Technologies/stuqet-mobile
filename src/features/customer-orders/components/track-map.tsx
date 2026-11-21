import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import type { Tracking } from "../types";

// Map card above the steps. The bundled illustration (demo) stands in for a real
// map: the kitchen pin and the home pin are drawn on the picture itself and the
// rider is a dot placed by its fractional position, which the tracking poll
// moves along the route.
export function TrackMap({ tracking }: { tracking: Tracking }) {
  const colors = useThemeColors();
  if (!tracking.mapImage) return null;
  const rider = tracking.riderPosition;

  return (
    <View
      accessibilityLabel={
        rider
          ? "Map showing your rider on the way"
          : "Map of the delivery route"
      }
      style={[SHADOWS.field, { aspectRatio: 900 / 576 }]}
      className="w-full overflow-hidden rounded-card border border-border bg-tint-deep"
    >
      <Image
        source={{ uri: tracking.mapImage }}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
      {rider ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: `${rider.x * 100}%`,
            top: `${rider.y * 100}%`,
            marginLeft: -17,
            marginTop: -17,
          }}
          className="h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-card bg-primary"
        >
          <Ionicons
            name="bicycle"
            size={17}
            color={colors["primary-foreground"]}
          />
        </View>
      ) : null}
    </View>
  );
}
