import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

/** Tinted panel the illustrations sit on (intro and welcome boards). */
export function ArtPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn("overflow-hidden rounded-[32px] bg-tint", className)}
    >
      <View className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-tint-deep" />
      {children}
    </View>
  );
}

/** A tilted white card with an icon tile and two grey lines (welcome art). */
export function MiniCard({
  icon,
  tone = "light",
  rotate = 0,
  className,
}: {
  icon: IconName;
  tone?: "light" | "brand" | "dark";
  rotate?: number;
  className?: string;
}) {
  const colors = useThemeColors();
  const bg =
    tone === "brand"
      ? "bg-primary"
      : tone === "dark"
        ? "bg-foreground"
        : "bg-card";
  const tile = "bg-tint";
  const line = tone === "light" ? "bg-border" : "bg-control";
  const color = colors["brand-text"];
  return (
    <View
      style={[SHADOWS.field, { transform: [{ rotate: `${rotate}deg` }] }]}
      className={cn(
        "h-[72px] w-52 flex-row items-center gap-3 rounded-2xl px-3.5",
        bg,
        className,
      )}
    >
      <View
        className={cn("h-10 w-10 items-center justify-center rounded-xl", tile)}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="flex-1 gap-2">
        <View className={cn("h-2 w-4/5 rounded-full", line)} />
        <View className={cn("h-2 w-3/5 rounded-full", line)} />
      </View>
    </View>
  );
}

/** Wide label card used by the "Meals, snacks and drinks" slide. */
export function LabelCard({
  icon,
  label,
  tone = "light",
  rotate = 0,
  className,
}: {
  icon: IconName;
  label: string;
  tone?: "light" | "dark";
  rotate?: number;
  className?: string;
}) {
  const colors = useThemeColors();
  const dark = tone === "dark";
  return (
    <View
      style={[SHADOWS.field, { transform: [{ rotate: `${rotate}deg` }] }]}
      className={cn(
        "h-16 w-56 flex-row items-center gap-3 rounded-2xl px-3.5",
        dark ? "bg-foreground" : "bg-card",
        className,
      )}
    >
      <View
        className={cn(
          "h-10 w-10 items-center justify-center rounded-xl",
          "bg-tint",
        )}
      >
        <Ionicons name={icon} size={20} color={colors["brand-text"]} />
      </View>
      <Text
        className={cn("font-sans-extrabold text-xl", dark && "text-background")}
      >
        {label}
      </Text>
    </View>
  );
}
