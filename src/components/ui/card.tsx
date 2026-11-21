import { View, type ViewProps } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { SHADOWS } from "~/lib/colors";

interface CardProps extends ViewProps {
  className?: string;
}

// White surface, 1px border, 20px radius, soft field shadow (boards).
export function Card({ className, children, style, ...props }: CardProps) {
  return (
    <View
      className={cn("rounded-card border border-border bg-card p-4", className)}
      style={[SHADOWS.field, style]}
      {...props}
    >
      {children}
    </View>
  );
}
