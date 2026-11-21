import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { ZoomIn, useReducedMotion } from "react-native-reanimated";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { PARTICLE_KEYFRAMES, RIPPLE } from "./motion";

type HeroTone = "brand" | "success" | "error";

const TONES: Record<
  HeroTone,
  { ring: string; core: string; color: "primary" | "success" | "destructive" }
> = {
  brand: { ring: "bg-tint", core: "bg-tint-border", color: "primary" },
  success: { ring: "bg-success-tint", core: "bg-success/20", color: "success" },
  error: {
    ring: "bg-destructive-tint",
    core: "bg-destructive-border",
    color: "destructive",
  },
};

interface HeroBadgeProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone?: HeroTone;
  className?: string;
}

// Concentric tinted circles around an icon: the status illustration on
// "check your inbox", "under review", "password reset", "suspended" screens.
export function HeroBadge({ icon, tone = "brand", className }: HeroBadgeProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const t = TONES[tone];
  const celebrate = tone === "success" && !reduced;

  return (
    <View className={cn("h-32 w-32 items-center justify-center", className)}>
      {celebrate ? (
        <>
          <Animated.View
            entering={RIPPLE}
            className={cn("absolute h-32 w-32 rounded-full", t.ring)}
          />
          {PARTICLE_KEYFRAMES.map((keyframe, index) => (
            <Animated.View
              key={index}
              entering={keyframe}
              className={cn(
                "absolute rounded-full",
                index % 3 === 0 ? "bg-primary" : "bg-success",
                index % 2 === 0 ? "h-2 w-2" : "h-1.5 w-1.5",
              )}
            />
          ))}
        </>
      ) : null}
      <Animated.View
        entering={reduced ? undefined : ZoomIn.springify().damping(12)}
        className={cn(
          "h-32 w-32 items-center justify-center rounded-full",
          t.ring,
        )}
      >
        <View
          className={cn(
            "h-24 w-24 items-center justify-center rounded-full",
            t.core,
          )}
        >
          <Animated.View
            entering={
              reduced ? undefined : ZoomIn.delay(220).springify().damping(8)
            }
          >
            <Ionicons name={icon} size={44} color={colors[t.color]} />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
