import type { ReactNode } from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils/helpers";
import { SHADOWS, useThemeColors } from "~/lib/colors";

// Pill buttons. The default (primary) button is 56px tall with white 19px bold
// text and an orange glow; outline is white with the field shadow (17px bold);
// soft is the brand tint; sm is 44px (15px bold) and keeps the touch target.
const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-pill active:opacity-90",
  {
    variants: {
      variant: {
        default: "bg-primary",
        outline: "border border-border bg-field",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
        secondary: "bg-secondary",
        soft: "border border-tint-border bg-tint",
      },
      size: {
        default: "min-h-button px-6",
        sm: "min-h-11 px-4",
        lg: "min-h-button px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("font-sans-bold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
      secondary: "text-secondary-foreground",
      soft: "text-brand-text",
    },
    size: {
      default: "text-[19px]",
      sm: "text-[15px]",
      lg: "text-[19px]",
      icon: "text-base",
    },
  },
  compoundVariants: [
    // Only the filled pills use the 19px label (large-text contrast). White,
    // soft and ghost pills at full size use 17px (boards).
    { variant: "outline", size: ["default", "lg"], className: "text-[17px]" },
    { variant: "secondary", size: ["default", "lg"], className: "text-[17px]" },
    { variant: "ghost", size: ["default", "lg"], className: "text-[17px]" },
    { variant: "soft", size: ["default", "lg"], className: "text-[17px]" },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonProps extends ButtonVariantProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  children: ReactNode;
  icon?: ReactNode;
}

// Maps each button variant to the palette key used for its text/icon color,
// so the ActivityIndicator spinner always matches the button label.
const VARIANT_COLOR_KEY = {
  default: "primary-foreground",
  outline: "foreground",
  ghost: "foreground",
  destructive: "destructive-foreground",
  secondary: "secondary-foreground",
  soft: "brand-text",
} as const satisfies Record<
  NonNullable<ButtonVariantProps["variant"]>,
  keyof ReturnType<typeof useThemeColors>
>;

export function Button({
  onPress,
  disabled,
  loading,
  variant,
  size,
  className,
  textClassName,
  children,
  icon,
}: ButtonProps) {
  const colors = useThemeColors();
  const spinnerColor = colors[VARIANT_COLOR_KEY[variant ?? "default"]];
  const inactive = disabled || loading;
  const glows = (variant ?? "default") === "default" && size !== "icon";
  const lifts = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        glows && !inactive
          ? SHADOWS.button
          : lifts && !inactive
            ? SHADOWS.field
            : undefined,
        // A small press-down so taps feel physical.
        pressed && !inactive ? { transform: [{ scale: 0.97 }] } : undefined,
      ]}
      className={cn(
        buttonVariants({ variant, size }),
        inactive && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          {typeof children === "string" ? (
            <Text
              className={cn(
                buttonTextVariants({ variant, size }),
                textClassName,
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </Pressable>
  );
}

export { buttonVariants, buttonTextVariants };
