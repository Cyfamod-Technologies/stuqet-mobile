import type { ComponentProps } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { ZoomIn, useReducedMotion } from "react-native-reanimated";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface StatusHeroProps {
  icon: IconName;
  /** Outer ring diameter (board values: 104, 132, 140, 148, 164, 168). */
  size: number;
  /** Solid core diameter. */
  core: number;
  iconSize: number;
  /** Extra soft circle between ring and core (password updated, fingerprint). */
  halo?: number;
  /** Rounded-square core (fingerprint) instead of a circle. */
  squircle?: boolean;
  /** `danger` is the red variant used by "Account suspended". */
  tone?: "brand" | "danger";
}

// The status illustration from the vendor boards: tinted ring, solid orange
// core with a white icon and a few confetti dots. Unlike the shared HeroBadge
// (tinted core, tinted icon), the boards use a solid core.
export function StatusHero({
  icon,
  size,
  core,
  iconSize,
  halo,
  squircle,
  tone = "brand",
}: StatusHeroProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const danger = tone === "danger";
  const coreOffset = (size - core) / 2;
  const haloOffset = halo ? (size - halo) / 2 : 0;
  const bigDot = Math.round(size * 0.1);
  const smallDot = Math.round(size * 0.07);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <View
        className={cn(
          "absolute inset-0 rounded-full border",
          danger
            ? "border-destructive-border bg-destructive-tint"
            : "border-tint-border bg-tint",
        )}
      />
      {halo ? (
        <View
          className={cn(
            "absolute rounded-full",
            danger ? "bg-destructive-border" : "bg-tint-border",
          )}
          style={{
            width: halo,
            height: halo,
            left: haloOffset,
            top: haloOffset,
          }}
        />
      ) : null}
      <Animated.View
        entering={
          reduced ? undefined : ZoomIn.delay(80).springify().damping(11)
        }
        className={cn(
          "absolute items-center justify-center",
          danger ? "bg-destructive" : "bg-primary",
        )}
        style={[
          {
            width: core,
            height: core,
            left: coreOffset,
            top: coreOffset,
            borderRadius: squircle ? 28 : core / 2,
          },
          SHADOWS.button,
        ]}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={
            danger
              ? colors["destructive-foreground"]
              : colors["primary-foreground"]
          }
        />
      </Animated.View>
      <View
        className={cn(
          "absolute rounded-full",
          danger ? "bg-destructive" : "bg-primary",
        )}
        style={{
          width: bigDot,
          height: bigDot,
          right: Math.round(size * 0.03),
          top: Math.round(size * 0.08),
        }}
      />
      <View
        className={cn(
          "absolute rounded-full",
          danger ? "bg-destructive-border" : "bg-tint-border",
        )}
        style={{
          width: smallDot,
          height: smallDot,
          left: -Math.round(size * 0.02),
          bottom: Math.round(size * 0.2),
        }}
      />
    </View>
  );
}
