import { View, Text } from "react-native";
import { cn } from "~/lib/utils/helpers";

type BadgeVariant =
  "default" | "success" | "destructive" | "warning" | "outline";

type VariantStyle = { container: string; text: string; dot: string };

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
  dot?: boolean;
}

/**
 * Tint tokens (`success-tint`, `tint`, …) already switch with the theme, so one
 * map serves light and dark.
 */
const variantStyles: Record<BadgeVariant, VariantStyle> = {
  default: {
    container: "border border-tint-border bg-tint",
    text: "text-brand-text",
    dot: "bg-primary",
  },
  success: {
    container: "border border-success/30 bg-success-tint",
    text: "text-success-text",
    dot: "bg-success",
  },
  destructive: {
    container: "border border-destructive/30 bg-destructive-tint",
    text: "text-destructive-text",
    dot: "bg-destructive",
  },
  warning: {
    container: "border border-warning/30 bg-warning-tint",
    text: "text-warning",
    dot: "bg-warning",
  },
  outline: {
    container: "border border-border bg-field",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function Badge({
  label,
  variant = "default",
  className,
  textClassName,
  dot,
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
        styles.container,
        className,
      )}
    >
      {dot && <View className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />}
      <Text
        className={cn("font-sans-semibold text-xs", styles.text, textClassName)}
      >
        {label}
      </Text>
    </View>
  );
}
