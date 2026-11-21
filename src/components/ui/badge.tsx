import { View, Text } from "react-native";
import { cn } from "~/lib/utils/helpers";

type BadgeVariant =
  "default" | "neutral" | "success" | "destructive" | "warning" | "outline";

type VariantStyle = { container: string; text: string; dot: string };

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
  dot?: boolean;
}

/**
 * Status pills from the boards: 24px tall, 10px padding, 12px bold, 1px
 * border. Tokens switch with the theme, so one map serves light and dark.
 * default = brand tint, neutral = grey (Open, On the way), success = Paid,
 * warning = Pending, destructive = Cancelled / Rejected.
 */
const variantStyles: Record<BadgeVariant, VariantStyle> = {
  default: {
    container: "border-tint-border bg-tint",
    text: "text-brand-text",
    dot: "bg-primary",
  },
  neutral: {
    container: "border-border bg-secondary",
    text: "text-neutral-text",
    dot: "bg-neutral-text",
  },
  success: {
    container: "border-success-border bg-success-tint",
    text: "text-success-text",
    dot: "bg-success",
  },
  destructive: {
    container: "border-destructive-border bg-destructive-tint",
    text: "text-destructive-text",
    dot: "bg-destructive",
  },
  warning: {
    container: "border-warning-border bg-warning-tint",
    text: "text-warning-text",
    dot: "bg-warning",
  },
  outline: {
    container: "border-border bg-field",
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
        "h-6 flex-row items-center gap-1.5 self-start rounded-full border px-2.5",
        styles.container,
        className,
      )}
    >
      {dot && <View className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />}
      <Text
        className={cn(
          "font-sans-bold text-xs leading-[14px]",
          styles.text,
          textClassName,
        )}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
