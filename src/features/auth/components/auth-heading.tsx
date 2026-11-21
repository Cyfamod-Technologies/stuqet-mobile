import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface AuthHeadingProps {
  title: string;
  subtitle: ReactNode;
  /** "lg": 34px title / 17px body (login, reset). "md": 32px / 16px (forgot). */
  size?: "lg" | "md";
}

// Left-aligned screen heading used by the login, forgot-password and reset
// boards.
export function AuthHeading({
  title,
  subtitle,
  size = "lg",
}: AuthHeadingProps) {
  const large = size === "lg";

  return (
    <View className="gap-1.5">
      <Text
        accessibilityRole="header"
        className={
          large
            ? "font-sans-extrabold text-[34px] leading-10"
            : "font-sans-extrabold text-[32px] leading-10"
        }
        style={{ letterSpacing: large ? -0.5 : -0.8 }}
      >
        {title}
      </Text>
      <Text
        tone="muted"
        className={
          large
            ? "font-sans-medium text-[17px] leading-6"
            : "font-sans-medium text-base leading-6"
        }
      >
        {subtitle}
      </Text>
    </View>
  );
}
