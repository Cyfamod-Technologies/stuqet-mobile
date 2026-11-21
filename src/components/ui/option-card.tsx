import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface OptionCardProps {
  title: string;
  subtitle?: string;
  /** Leading 40px icon tile. */
  icon?: IconName;
  /** Replaces the icon tile (a logo, an avatar). */
  leading?: ReactNode;
  selected: boolean;
  onPress: () => void;
  /** "radio" draws a round dot, "check" a rounded tick (multi-select). */
  control?: "radio" | "check" | "none";
}

// Selectable card from the onboarding boards (school, food types, vehicle):
// white with a hairline border; selected = 1.5px brand border and tint fill.
export function OptionCard({
  title,
  subtitle,
  icon,
  leading,
  selected,
  onPress,
  control = "radio",
}: OptionCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={control === "check" ? "checkbox" : "radio"}
      accessibilityState={{ selected, checked: selected }}
      style={SHADOWS.field}
      className={cn(
        "min-h-16 flex-row items-center gap-3.5 rounded-card border px-4 py-3 active:opacity-90",
        selected
          ? "border-[1.5px] border-primary bg-tint"
          : "border-border bg-card",
      )}
    >
      {leading ??
        (icon ? (
          <View
            className={cn(
              "h-10 w-10 items-center justify-center rounded-tile",
              selected ? "bg-primary" : "bg-tint",
            )}
          >
            <Ionicons
              name={icon}
              size={20}
              color={
                selected ? colors["primary-foreground"] : colors["brand-text"]
              }
            />
          </View>
        ) : null)}
      <View className="min-w-0 flex-1 gap-px">
        <Text
          variant="heading"
          numberOfLines={1}
          className="text-base leading-[22px]"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="meta" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {control === "radio" ? (
        <View
          className={cn(
            "h-6 w-6 items-center justify-center rounded-full border-[1.5px]",
            selected ? "border-primary" : "border-control",
          )}
        >
          {selected ? (
            <View className="h-3 w-3 rounded-full bg-primary" />
          ) : null}
        </View>
      ) : control === "check" ? (
        <View
          className={cn(
            "h-6 w-6 items-center justify-center rounded-full",
            selected ? "bg-primary" : "border-[1.5px] border-control",
          )}
        >
          {selected ? (
            <Ionicons
              name="checkmark"
              size={15}
              color={colors["primary-foreground"]}
            />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
